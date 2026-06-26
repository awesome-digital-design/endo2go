import { useState } from "react";
import { ImageOff, Meh, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ProfileSummary } from "@/components/ProfileSummary";
import { WaiterCard } from "@/components/WaiterCard";
import { content } from "@/lib/content";
import type {
  DishResult,
  MenuAnalysis,
  Suitability,
  UserProfile,
} from "@/types/domain";

interface Props {
  analysis: MenuAnalysis | null;
  profile: UserProfile | null;
  onEdit: () => void;
  onBackToCapture: () => void;
}

// Example questions for the empty "niets gevonden" state.
const EXAMPLE_QUESTIONS = [
  "Kunt u een gerecht zonder saus en gefrituurde onderdelen maken?",
  "Is er iets met gegrilde groenten of vis op het menu?",
];

const badgeClass: Record<Suitability, string> = {
  suitable: "bg-success/10 text-success border-success/30",
  possibly_suitable: "bg-warning/15 text-warning-foreground border-warning/40",
};

const dotClass: Record<Suitability, string> = {
  suitable: "bg-success",
  possibly_suitable: "bg-warning",
};

export function ResultsScreen({
  analysis,
  profile,
  onEdit,
  onBackToCapture,
}: Props) {
  // Which dish's waiter card is currently shown in the drawer (null = closed).
  const [activeDish, setActiveDish] = useState<DishResult | null>(null);

  if (!analysis) return null;

  const items = analysis.items;
  const reason = analysis.message?.reason;
  const isEmpty = items.length === 0 || reason !== undefined;

  return (
    <div className="flex flex-col gap-4">
      {profile && <ProfileSummary profile={profile} onEdit={onEdit} />}

      {isEmpty ? (
        reason === "not_a_menu" ? (
          <EmptyState
            icon={<ImageOff className="size-10 text-muted-foreground" />}
            text={content.texts.errors.notAMenu}
            buttonLabel="Opnieuw proberen"
            onClick={onBackToCapture}
          />
        ) : (
          <EmptyState
            icon={<Meh className="size-10 text-muted-foreground" />}
            text={content.texts.errors.noSuitable}
            buttonLabel="Nieuwe foto maken"
            onClick={onBackToCapture}
          >
            <ul className="flex flex-col gap-2 text-left text-sm">
              {EXAMPLE_QUESTIONS.map((q) => (
                <li key={q} className="text-muted-foreground">
                  “{q}”
                </li>
              ))}
            </ul>
          </EmptyState>
        )
      ) : (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-medium">
              {items.length} gerechten lijken geschikt
            </h1>
            <p className="text-sm text-muted-foreground">
              Controleer ze altijd bij de kok.
            </p>
          </header>

          <DishGroups items={items} onShowWaiter={setActiveDish} />

          <Drawer
            open={activeDish !== null}
            onOpenChange={(open) => {
              if (!open) setActiveDish(null);
            }}
          >
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{activeDish?.name}</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-6">
                {activeDish && <WaiterCard dish={activeDish} />}
              </div>
            </DrawerContent>
          </Drawer>

          <p className="text-center text-xs text-muted-foreground">
            {content.texts.disclaimer}
          </p>
        </>
      )}
    </div>
  );
}

function DishGroups({
  items,
  onShowWaiter,
}: {
  items: DishResult[];
  onShowWaiter: (dish: DishResult) => void;
}) {
  const suitable = items.filter((d) => d.suitability === "suitable");
  const possibly = items.filter((d) => d.suitability === "possibly_suitable");

  return (
    <Accordion type="single" collapsible className="flex flex-col gap-4">
      {suitable.length > 0 && (
        <div className="flex flex-col">
          <GroupHeader
            suitability="suitable"
            label={content.statusLabels.suitable.label}
          />
          {suitable.map((dish) => (
            <DishRow key={dish.name} dish={dish} onShowWaiter={onShowWaiter} />
          ))}
        </div>
      )}
      {possibly.length > 0 && (
        <div className="flex flex-col">
          <GroupHeader
            suitability="possibly_suitable"
            label={content.statusLabels.possibly_suitable.label}
          />
          {possibly.map((dish) => (
            <DishRow key={dish.name} dish={dish} onShowWaiter={onShowWaiter} />
          ))}
        </div>
      )}
    </Accordion>
  );
}

function GroupHeader({
  suitability,
  label,
}: {
  suitability: Suitability;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 py-2 text-sm font-medium">
      <span className={`size-2 rounded-full ${dotClass[suitability]}`} />
      {label}
    </div>
  );
}

function DishRow({
  dish,
  onShowWaiter,
}: {
  dish: DishResult;
  onShowWaiter: (dish: DishResult) => void;
}) {
  const status = content.statusLabels[dish.suitability];

  return (
    <AccordionItem value={dish.name}>
      <AccordionTrigger>
        <div className="flex flex-1 flex-col gap-1 pr-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{dish.name}</span>
            <Badge
              variant="outline"
              className={badgeClass[dish.suitability]}
            >
              {status.label}
            </Badge>
          </div>
          <span className="text-xs font-normal text-muted-foreground">
            zekerheid: {content.confidenceLabels[dish.confidence]}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3">
        <p>{dish.desc_nl}</p>
        <p className="text-sm text-muted-foreground">
          Vermoedelijk: {dish.ingredients.join(", ")}
        </p>
        {dish.ask_user.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Vraag aan de kok</p>
            <ul className="flex flex-col gap-2">
              {dish.ask_user.map((user, i) => (
                <li key={i} className="flex flex-col gap-0.5">
                  <span className="text-sm">{user}</span>
                  {dish.ask_menu[i] && (
                    <span className="text-sm text-muted-foreground italic">
                      {dish.ask_menu[i]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="mt-1 w-full"
              onClick={() => onShowWaiter(dish)}
            >
              <Receipt />
              Toon aan de ober
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function EmptyState({
  icon,
  text,
  buttonLabel,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  text: string;
  buttonLabel: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      {icon}
      <p className="text-sm text-muted-foreground">{text}</p>
      {children}
      <Button variant="outline" className="w-full" onClick={onClick}>
        {buttonLabel}
      </Button>
    </div>
  );
}
