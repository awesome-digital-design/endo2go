import type { Dietary, UserProfile } from "@/types/domain";
import { defaultLanguage, onboardingSteps } from "@/lib/content";

const PROFILE_KEY = "endo2go.profile";
const ONBOARDED_KEY = "endo2go.onboarded";

// Compile the checked options + per-step notes + extra note into a readable
// Dutch paragraph, grouped per step (step title + selected labels + step note),
// then the extra note appended on its own.
export function compileSensitivities(
  selections: string[],
  stepNotes: Record<string, string>,
  extraNote: string,
): string {
  const parts: string[] = [];
  for (const step of onboardingSteps) {
    const labels = step.options
      .filter((o) => selections.includes(o.id))
      .map((o) => o.label);
    const note = (stepNotes[step.id] ?? "").trim();
    if (labels.length === 0 && !note) continue;
    let body = labels.join(", ");
    if (note) body = body ? `${body} (${note})` : note;
    parts.push(`${step.title}: ${body}`);
  }
  const extra = extraNote.trim();
  if (extra) parts.push(extra);
  return parts.length ? `${parts.join(". ")}.` : "";
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile> & {
      version?: number;
    };
    if (parsed?.version === 3) {
      return {
        version: 3,
        dietary: parsed.dietary ?? "omnivore",
        language: parsed.language || defaultLanguage,
        selections: parsed.selections ?? [],
        stepNotes: parsed.stepNotes ?? {},
        extraNote: parsed.extraNote ?? "",
        sensitivities: parsed.sensitivities ?? "",
      };
    }
    // Migrate legacy v1/v2 profiles: keep their free-text sensitivities, but
    // with empty selections (they re-pick options if they edit).
    if (parsed?.version === 1 || parsed?.version === 2) {
      return {
        version: 3,
        dietary: (parsed.dietary as Dietary) ?? "omnivore",
        language: parsed.language || defaultLanguage,
        selections: [],
        stepNotes: {},
        extraNote: "",
        sensitivities: parsed.sensitivities ?? "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveProfile(p: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export function resetAll(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(ONBOARDED_KEY);
}

export function hasOnboarded(): boolean {
  return localStorage.getItem(ONBOARDED_KEY) === "true";
}

export function setOnboarded(): void {
  localStorage.setItem(ONBOARDED_KEY, "true");
}

// What the user avoids, as human-readable strings: the free-text sensitivities
// summary from the conversational profile (empty when nothing to avoid). Used
// to build the analyze request.
export function getAvoidLabels(profile: UserProfile): string[] {
  const text = profile.sensitivities.trim();
  return text ? [text] : [];
}
