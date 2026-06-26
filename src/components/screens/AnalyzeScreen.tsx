import { useEffect, useState } from "react";
import { Loader2, CircleCheck } from "lucide-react";

interface Props {
  onAnalyze: () => void;
}

const STEPS = [
  "Kaart gelezen",
  "Gerechten gevonden",
  "Beoordelen op jouw profiel…",
] as const;

export function AnalyzeScreen({ onAnalyze }: Props) {
  // Index of the currently active step; earlier steps are completed.
  const [active, setActive] = useState(0);

  useEffect(() => {
    onAnalyze();
    // Advance the progress list while the request is in flight, then hold on the
    // last step (spinner keeps running) until the parent swaps to the results
    // screen once runAnalysis() resolves.
    const t1 = setTimeout(() => setActive(1), 2000);
    const t2 = setTimeout(() => setActive(2), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <Loader2 className="size-10 animate-spin text-primary" />

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-medium">Menukaart analyseren…</h1>
        <p className="text-sm text-muted-foreground">
          Dit duurt meestal een halve minuut.
        </p>
      </div>

      <ul className="flex w-full flex-col gap-3 text-left">
        {STEPS.map((label, i) => {
          const done = i < active;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center">
                {done ? (
                  <CircleCheck className="size-5 text-success" />
                ) : i === active ? (
                  <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                )}
              </span>
              <span className={done ? "text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
