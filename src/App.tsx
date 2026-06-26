import { useFlow } from "@/hooks/useFlow";
import { Toaster } from "@/components/ui/sonner";
import { ProfileSummary } from "@/components/ProfileSummary";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { CaptureScreen } from "@/components/screens/CaptureScreen";
import { OnboardingSteps } from "@/components/screens/OnboardingSteps";
import { AnalyzeScreen } from "@/components/screens/AnalyzeScreen";
import { ResultsScreen } from "@/components/screens/ResultsScreen";

export function App() {
  const flow = useFlow();

  // ResultsScreen renders its own summary, so the shell only shows it on capture.
  const showSummary = flow.profile && flow.step === "capture";

  function renderStep() {
    switch (flow.step) {
      case "welcome":
        return <WelcomeScreen onStart={flow.start} />;
      case "capture":
        return (
          <CaptureScreen
            images={flow.images}
            setImages={flow.setImages}
            onSubmit={flow.proceedFromCapture}
          />
        );
      case "profile":
        // Guided step-based onboarding for both build (no profile) and edit
        // (existing profile) — it derives its mode from `profile`.
        return (
          <OnboardingSteps
            profile={flow.profile}
            onSubmit={flow.submitProfile}
            onCancel={flow.cancelProfileEdit}
          />
        );
      case "analyze":
        return <AnalyzeScreen onAnalyze={flow.runAnalysis} />;
      case "results":
        return (
          <ResultsScreen
            analysis={flow.analysis}
            profile={flow.profile}
            onEdit={flow.editProfile}
            onBackToCapture={flow.backToCapture}
          />
        );
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col gap-4 p-6">
      {showSummary && flow.profile && (
        <ProfileSummary profile={flow.profile} onEdit={flow.editProfile} />
      )}
      {renderStep()}
      <Toaster />
    </div>
  );
}

export default App;
