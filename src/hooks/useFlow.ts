import { useState } from "react";
import { toast } from "sonner";
import type { MenuAnalysis, UserProfile } from "@/types/domain";
import {
  loadProfile,
  saveProfile,
  hasOnboarded,
  setOnboarded,
  getAvoidLabels,
  resetAll as resetAllStorage,
} from "@/lib/profile";

export type Step = "welcome" | "capture" | "profile" | "analyze" | "results";

function initialStep(profile: UserProfile | null): Step {
  return hasOnboarded() && profile ? "capture" : "welcome";
}

export function useFlow() {
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    loadProfile(),
  );
  const [step, setStep] = useState<Step>(() => initialStep(profile));
  const [images, setImagesState] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<MenuAnalysis | null>(null);
  // When editing the profile mid-flow, remember where to return afterwards.
  const [profileReturnStep, setProfileReturnStep] = useState<Step | null>(null);

  // welcome → profile: onboarding now comes before the first upload.
  function start() {
    setStep("profile");
  }

  function setImages(imgs: string[]) {
    setImagesState(imgs);
  }

  // capture → analyze. A profile always exists by the time Capture is reached,
  // so this always advances to the analyze step (which runs runAnalysis).
  function proceedFromCapture() {
    setStep("analyze");
  }

  // Jump to onboarding in edit mode, remembering where to return.
  function editProfile() {
    setProfileReturnStep(step);
    setStep("profile");
  }

  // Cancel an edit without saving: return to the step the user came from.
  function cancelProfileEdit() {
    if (profileReturnStep) {
      setStep(profileReturnStep);
      setProfileReturnStep(null);
    }
  }

  // Persist the profile. When editing, return to the saved step; otherwise
  // (first-run build) continue to capture so the user uploads their first menu.
  function submitProfile(p: UserProfile) {
    saveProfile(p);
    setOnboarded();
    setProfile(p);
    if (profileReturnStep) {
      setStep(profileReturnStep);
      setProfileReturnStep(null);
    } else {
      setStep("capture");
    }
  }

  // analyze → results. POSTs the downscaled photos to the serverless function
  // and waits for the real Gemini-backed analysis. On any failure we surface a
  // toast and return to capture so the user can retry.
  async function runAnalysis() {
    if (!profile) {
      setStep("capture");
      return;
    }
    try {
      const res = await fetch("/api/analyze-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          triggers: getAvoidLabels(profile),
          dietary: profile.dietary,
          language: profile.language,
        }),
      });
      if (!res.ok) {
        // 503 = Gemini temporarily overloaded; a distinct, reassuring message.
        toast.error(
          res.status === 503
            ? "Even erg druk bij de AI. Probeer het zo nog eens."
            : "Er ging iets mis bij de analyse. Probeer het opnieuw.",
        );
        setStep("capture");
        return;
      }
      const data = (await res.json()) as MenuAnalysis;
      setAnalysis(data);
      setStep("results");
    } catch {
      toast.error("Er ging iets mis bij de analyse. Probeer het opnieuw.");
      setStep("capture");
    }
  }

  function reset() {
    setImagesState([]);
    setAnalysis(null);
    setStep(initialStep(profile));
  }

  // Return to the capture screen for a new photo (keeps the saved profile).
  function backToCapture() {
    setAnalysis(null);
    setStep("capture");
  }

  // Clears on-device storage and returns the flow to its first-run state.
  function resetAll() {
    resetAllStorage();
    setProfile(null);
    setImagesState([]);
    setAnalysis(null);
    setStep("welcome");
  }

  const isReturning = hasOnboarded() && !!profile;

  return {
    step,
    images,
    profile,
    analysis,
    isReturning,
    start,
    setImages,
    proceedFromCapture,
    editProfile,
    cancelProfileEdit,
    submitProfile,
    runAnalysis,
    reset,
    backToCapture,
    resetAll,
  };
}
