import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import type { UserProfile } from "@/types/domain";

interface Props {
  profile: UserProfile;
  onEdit: () => void;
}

export function ProfileSummary({ profile, onEdit }: Props) {
  const dietaryLabel =
    content.dietaryOptions.find((o) => o.value === profile.dietary)?.label ??
    profile.dietary;

  const sensitivities = profile.sensitivities.trim();

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-input px-3 py-2 text-xs">
      <p className="min-w-0 truncate text-muted-foreground">
        <span className="font-medium text-foreground">{dietaryLabel}</span>
        {sensitivities && (
          <>
            {" · "}
            {sensitivities}
          </>
        )}
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={onEdit}
        className="shrink-0"
      >
        <SlidersHorizontal />
        Aanpassen
      </Button>
    </div>
  );
}
