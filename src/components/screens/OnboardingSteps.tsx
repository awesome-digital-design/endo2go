import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { content, onboardingSteps } from "@/lib/content";
import type { OnboardingStep } from "@/lib/content";
import { compileSensitivities } from "@/lib/profile";
import { cn } from "@/lib/utils";
import type { Dietary, UserProfile } from "@/types/domain";

interface Props {
  // null → build mode (first run); set → edit mode (pre-checked, cancellable).
  profile: UserProfile | null;
  onSubmit: (profile: UserProfile) => void;
  onCancel: () => void;
}

// One screen per step, plus a final "extra note + dietary" screen.
const TOTAL = onboardingSteps.length + 1;

export function OnboardingSteps({ profile, onSubmit, onCancel }: Props) {
  const isEdit = profile !== null;

  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<string[]>(
    profile ? [...profile.selections] : [],
  );
  const [stepNotes, setStepNotes] = useState<Record<string, string>>(
    profile ? { ...profile.stepNotes } : {},
  );
  const [extraNote, setExtraNote] = useState(profile?.extraNote ?? "");
  const [dietary, setDietary] = useState<Dietary>(
    profile?.dietary ?? "omnivore",
  );

  const isFinal = index === onboardingSteps.length;
  const step = isFinal ? null : onboardingSteps[index];

  function toggle(optionId: string) {
    setSelections((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  }

  function setNote(stepId: string, value: string) {
    setStepNotes((prev) => ({ ...prev, [stepId]: value }));
  }

  function back() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    if (!isFinal) {
      setIndex((i) => i + 1);
      return;
    }
    const sensitivities = compileSensitivities(selections, stepNotes, extraNote);
    const built: UserProfile = {
      version: 3,
      dietary,
      language: profile?.language ?? "nl",
      selections,
      stepNotes,
      extraNote,
      sensitivities,
    };
    onSubmit(built);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          stap {index + 1} van {TOTAL}
        </p>
        {isEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            <X />
            Annuleren
          </Button>
        )}
      </div>

      {step ? (
        <StepView
          step={step}
          selections={selections}
          note={stepNotes[step.id] ?? ""}
          onToggle={toggle}
          onNote={(v) => setNote(step.id, v)}
        />
      ) : (
        <FinalView
          extraNote={extraNote}
          onExtraNote={setExtraNote}
          dietary={dietary}
          onDietary={setDietary}
        />
      )}

      <div className="mt-auto flex gap-2 pt-2">
        {index > 0 && (
          <Button variant="outline" className="flex-1" onClick={back}>
            <ArrowLeft />
            Terug
          </Button>
        )}
        <Button className="flex-1" onClick={next}>
          {isFinal ? "Opslaan" : "Volgende"}
          {!isFinal && <ArrowRight />}
        </Button>
      </div>
    </div>
  );
}

function StepView({
  step,
  selections,
  note,
  onToggle,
  onNote,
}: {
  step: OnboardingStep;
  selections: string[];
  note: string;
  onToggle: (id: string) => void;
  onNote: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-medium">{step.title}</h1>
        <p className="text-sm text-muted-foreground">{step.why}</p>
      </header>

      <div className="flex flex-col gap-2">
        {step.options.map((option) => {
          const checked = selections.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => onToggle(option.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                checked
                  ? "border-primary bg-primary/5"
                  : "border-input hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-md border",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input",
                )}
              >
                {checked && <Check className="size-3.5" />}
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <Textarea
        value={note}
        onChange={(e) => onNote(e.target.value)}
        placeholder="anders…"
        rows={2}
      />
    </div>
  );
}

function FinalView({
  extraNote,
  onExtraNote,
  dietary,
  onDietary,
}: {
  extraNote: string;
  onExtraNote: (value: string) => void;
  dietary: Dietary;
  onDietary: (value: Dietary) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-medium">
          {content.texts.onboarding.extraNotePrompt}
        </h1>
        <Textarea
          value={extraNote}
          onChange={(e) => onExtraNote(e.target.value)}
          placeholder="bijv. een allergie of iets waar je extra op let"
          rows={3}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Dieet</h2>
        <RadioGroup
          value={dietary}
          onValueChange={(v) => onDietary(v as Dietary)}
        >
          {content.dietaryOptions.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem value={option.value} id={`dietary-${option.value}`} />
              <Label htmlFor={`dietary-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </section>
    </div>
  );
}
