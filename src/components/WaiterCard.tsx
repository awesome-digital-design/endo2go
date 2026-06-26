import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import type { DishResult } from "@/types/domain";

interface Props {
  dish: DishResult;
}

// Per-dish waiter card: the chef questions for THIS dish only, large and
// readable in the menu language (ask_menu, falling back to ask_user when the
// menu is already in the user's language), with the user's own-language
// version as a small muted reference line when it differs.
export function WaiterCard({ dish }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {dish.ask_user.map((user, i) => {
          const read = dish.ask_menu[i] ?? user;
          return (
            <li key={i} className="flex flex-col gap-0.5">
              {user !== read && (
                <span className="text-sm text-muted-foreground italic">
                  {user}
                </span>
              )}
              <span className="text-lg leading-snug">{read}</span>
            </li>
          );
        })}
      </ul>

      <DrawerClose asChild>
        <Button variant="outline" className="w-full">
          Sluiten
        </Button>
      </DrawerClose>
    </div>
  );
}
