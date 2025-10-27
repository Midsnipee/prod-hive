import { DashboardWidgetConfig } from "./DashboardWidget";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";

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
}: WidgetManagerProps) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="border-border max-h-[85vh]">
      <DrawerHeader>
        <DrawerTitle>Organisation du dashboard</DrawerTitle>
        <DrawerDescription>
          Activez, désactivez et réorganisez les widgets visibles. Les préférences sont conservées localement.
        </DrawerDescription>
      </DrawerHeader>
      <ScrollArea className="flex-1 px-6 pb-6">
        <div className="grid gap-4 pb-6">
          {availableWidgets.map(widget => {
            const enabled = activeWidgetIds.includes(widget.id);
            return (
              <div key={widget.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {widget.size}
                    </Badge>
                    <span className="font-semibold">{widget.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xl">{widget.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GripVertical className="h-3.5 w-3.5" />
                    Glissez-déposez ou utilisez les flèches pour réordonner.
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <Switch checked={enabled} onCheckedChange={() => onToggleWidget(widget.id)} />
                  {enabled && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMoveWidget(widget.id, "up")}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMoveWidget(widget.id, "down")}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <DrawerFooter className="border-t border-border bg-muted/40">
        <Button onClick={() => onOpenChange(false)}>Fermer</Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);

