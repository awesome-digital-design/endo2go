// Vercel serverless function: analyze menu photos with Gemini.
// Uses plain fetch against the Gemini REST API (no SDK).

import type {
  AnalyzeRequest,
  MenuAnalysis,
  DishResult,
} from "../src/types/domain.js";
import { responseSchema } from "./_schema.js";
import { SYSTEM_PROMPT, buildUserText } from "./_prompt.js";

// Minimal Vercel Node request/response shapes so we don't depend on @vercel/node.
interface VercelRequest {
  method?: string;
  body: unknown;
}
interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
}

// Model fallback chain, tried in order. The primary is gemini-3.5-flash for
// accuracy and reliability; we only advance to the cheaper flash-lite fallback
// when the primary is persistently overloaded or times out — see the request
// loop below.
const MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
const endpointFor = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Transient overload signals worth retrying / failing over.
const OVERLOAD_RE = /overloaded|unavailable|high demand/i;
// Keep the whole handler comfortably under the production time limit: one
// retry per model with a short backoff, and a hard per-attempt timeout.
const MAX_RETRIES = 1;
const ATTEMPT_TIMEOUT_MS = 15_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Convert a data URL ("data:image/jpeg;base64,XXXX") into a Gemini inline part.
function toInlinePart(dataUrl: string): {
  inline_data: { mime_type: string; data: string };
} {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  const mime_type = match ? match[1] : "image/jpeg";
  const data = match ? match[2] : dataUrl.replace(/^data:[^,]*,/, "");
  return { inline_data: { mime_type, data } };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    await runHandler(req, res);
  } catch (err) {
    // Last-resort guard: any thrown error returns a JSON 500 rather than
    // letting the function crash with FUNCTION_INVOCATION_FAILED.
    console.error("analyze-menu handler failed", err);
    res.status(500).json({ error: "analysis_failed" });
  }
}

async function runHandler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY missing in environment" });
    return;
  }

  const { images, triggers, dietary } = (req.body ?? {}) as Partial<AnalyzeRequest>;
  if (!Array.isArray(images) || images.length === 0) {
    res.status(400).json({ error: "No menu images provided." });
    return;
  }

  // Structured to maximize Gemini's automatic implicit prompt caching: the
  // large static SYSTEM_PROMPT goes in systemInstruction as the cacheable
  // prefix (kept byte-for-byte identical across requests — no timestamps or
  // dynamic values), while only the variable per-request data (trigger/dietary
  // text and images) lives in contents after it. No explicit CachedContent —
  // implicit caching is free and automatic.
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: buildUserText(triggers ?? [], dietary ?? "omnivore") },
          ...images.map(toInlinePart),
        ],
      },
    ],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2,
    },
  };

  // Request loop: try each model in order. Within a model, retry transient
  // overloads once with a short backoff. Only advance to the next model on
  // persistent overload or a per-attempt timeout; any non-503 error returns
  // immediately. A hard AbortController timeout on every fetch keeps the whole
  // handler well under the production time limit.
  let geminiRes: Response | null = null;
  for (const model of MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
      let r: Response;
      try {
        r = await fetch(endpointFor(model), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      } catch (err) {
        // A timeout (abort) is treated like an overload: stop retrying this
        // model and fail over to the next one.
        if (controller.signal.aborted) {
          console.error(`Model ${model} timed out after ${ATTEMPT_TIMEOUT_MS}ms`);
          break;
        }
        res.status(500).json({ error: "Could not reach the analysis service. Please try again." });
        return;
      } finally {
        clearTimeout(timer);
      }

      if (r.ok) {
        geminiRes = r;
        break;
      }

      // Read the body once so we can inspect it and report it if needed.
      const detail = await r.text();
      const overloaded = r.status === 503 || OVERLOAD_RE.test(detail);

      if (overloaded) {
        // Back off briefly and retry the same model, or move on once retries
        // are spent. Keep the backoff small so the total stays within budget.
        if (attempt < MAX_RETRIES) {
          await sleep(500);
          continue;
        }
        console.error(`Model ${model} overloaded after retries`, r.status, detail);
        break;
      }

      // Keep the existing 429 handling: pass the rate-limit status through.
      if (r.status === 429) {
        console.error("Gemini rate limited", detail);
        res.status(429).json({ error: "Gemini error", status: 429, detail });
        return;
      }

      // TEMPORARY DEBUGGING: surface any other upstream cause verbatim.
      console.error("Gemini error", r.status, detail);
      res.status(500).json({ error: "Gemini error", status: r.status, detail });
      return;
    }

    if (geminiRes) break;
  }

  // Whole chain exhausted by persistent overload.
  if (!geminiRes) {
    console.error("All models overloaded — returning busy");
    res.status(503).json({ error: "busy" });
    return;
  }

  const payload = (await geminiRes.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let analysis: MenuAnalysis;
  try {
    analysis = JSON.parse(raw) as MenuAnalysis;
  } catch (err) {
    console.error("parse failed", err, raw);
    res.status(500).json({ error: "parse failed", raw });
    return;
  }

  // Suitable dishes first, then possibly_suitable.
  const rank = (d: DishResult): number => (d.suitability === "suitable" ? 0 : 1);
  analysis.items = [...analysis.items].sort((a, b) => rank(a) - rank(b));

  res.status(200).json(analysis);
}

export const config = { maxDuration: 60 };
