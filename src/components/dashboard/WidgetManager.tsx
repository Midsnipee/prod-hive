import { DashboardWidgetConfig } from "./DashboardWidget";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

interface WidgetManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableWidgets: DashboardWidgetConfig[];
  activeWidgetIds: string[];
  onToggleWidget: (id: string) => void;
  onMoveWidget: (id: string, direction: "up" | "down") => void;
}

export const WidgetManager = ({
  open,
  onOpenChange,
  availableWidgets,
  activeWidgetIds,
  onToggleWidget,
  onMoveWidget
}: WidgetManagerProps) => {
  const activeWidgets = availableWidgets.filter(widget => activeWidgetIds.includes(widget.id));
  const inactiveWidgets = availableWidgets.filter(widget => !activeWidgetIds.includes(widget.id));

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border h-[90vh] flex flex-col">
        <DrawerHeader className="px-6 flex-shrink-0">
          <DrawerTitle>Organisation du dashboard</DrawerTitle>
          <DrawerDescription>
            Activez ou désactivez les cartes et réordonnez l&apos;affichage de votre tableau de bord.
          </DrawerDescription>
        </DrawerHeader>
        <Separator className="mx-6 flex-shrink-0" />
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-8 py-6">
            <section className="space-y-4">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Widgets actifs</p>
                <p className="text-sm text-muted-foreground">
                  Ces widgets sont visibles sur le dashboard. Modifiez leur ordre pour ajuster la présentation.
                </p>
              </header>
              <div className="grid gap-3">
                {activeWidgets.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Aucun widget n&apos;est actif pour le moment.
                  </p>
                )}
                {activeWidgets.map(widget => (
                  <article
                    key={widget.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-primary/40 bg-primary/5 p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {widget.size}
                        </Badge>
                        <span className="font-semibold">{widget.title}</span>
                      </div>
                      <p className="max-w-xl text-sm text-muted-foreground">{widget.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GripVertical className="h-3.5 w-3.5" />
                        Utilisez les flèches pour ajuster l&apos;ordre d&apos;affichage.
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Switch checked onCheckedChange={() => onToggleWidget(widget.id)} />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onMoveWidget(widget.id, "up")}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onMoveWidget(widget.id, "down")}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Widgets disponibles</p>
                <p className="text-sm text-muted-foreground">
                  Activez des widgets supplémentaires pour enrichir votre vue d&apos;ensemble.
                </p>
              </header>
              <div className="grid gap-3">
                {inactiveWidgets.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Tous les widgets sont déjà affichés.
                  </p>
                )}
                {inactiveWidgets.map(widget => (
                  <article
                    key={widget.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {widget.size}
                        </Badge>
                        <span className="font-semibold">{widget.title}</span>
                      </div>
                      <p className="max-w-xl text-sm text-muted-foreground">{widget.description}</p>
                    </div>
                    <Switch checked={false} onCheckedChange={() => onToggleWidget(widget.id)} />
                  </article>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
        <DrawerFooter className="border-t border-border bg-muted/40 flex-shrink-0">
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
