import {
  UtensilsCrossed,
  Camera,
  ListChecks,
  MessageCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { content } from "@/lib/content";

interface Props {
  onStart: () => void;
}

const steps = [
  { icon: Camera, label: "Fotografeer de menukaart" },
  { icon: ListChecks, label: "Zie welke gerechten passen" },
  { icon: MessageCircle, label: "Vraag het na bij de kok" },
] as const;

export function WelcomeScreen({ onStart }: Props) {
  const { welcome } = content.texts;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UtensilsCrossed className="size-8" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium">{welcome.title}</h1>
        <p className="text-sm text-muted-foreground">{welcome.subtitle}</p>
      </div>

      <ul className="flex w-full flex-col gap-3 text-left">
        {steps.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <span className="text-sm">{label}</span>
          </li>
        ))}
      </ul>

      <Alert>
        <Info />
        <AlertDescription>{welcome.scope}</AlertDescription>
      </Alert>

      <Button className="w-full" onClick={onStart}>
        Begin
      </Button>
    </div>
  );
}
