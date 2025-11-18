import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, UserCheck, Trash2, UserX, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type MovementType = "entry" | "exit" | null;
type ActionType = "assign" | "discard" | "unassign" | "add" | null;

interface MaterialMovementDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MaterialMovementDialog({ open, onClose }: MaterialMovementDialogProps) {
  const [movementType, setMovementType] = useState<MovementType>(null);
  const [actionType, setActionType] = useState<ActionType>(null);

  const handleClose = () => {
    setMovementType(null);
    setActionType(null);
    onClose();
  };

  const handleBack = () => {
    if (actionType) {
      setActionType(null);
    } else {
      setMovementType(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {!movementType && "Mouvement de matériel"}
            {movementType === "entry" && !actionType && "Entrée de matériel"}
            {movementType === "exit" && !actionType && "Sortie de matériel"}
            {actionType === "assign" && "Attribution"}
            {actionType === "discard" && "Mise au rebut"}
            {actionType === "unassign" && "Désattribution"}
            {actionType === "add" && "Ajout manuel"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!movementType && (
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setMovementType("entry")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <ArrowDown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Entrée</h3>
                    <p className="text-sm text-muted-foreground">
                      Désattribution ou ajout
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setMovementType("exit")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="rounded-full bg-destructive/10 p-3">
                    <ArrowUp className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Sortie</h3>
                    <p className="text-sm text-muted-foreground">
                      Attribution ou rebut
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {movementType === "entry" && !actionType && (
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setActionType("unassign")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <UserX className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Désattribution</h3>
                    <p className="text-sm text-muted-foreground">
                      Retour en stock
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setActionType("add")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Ajout manuel</h3>
                    <p className="text-sm text-muted-foreground">
                      Nouveau matériel
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {movementType === "exit" && !actionType && (
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setActionType("assign")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="rounded-full bg-destructive/10 p-3">
                    <UserCheck className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Attribution</h3>
                    <p className="text-sm text-muted-foreground">
                      Attribuer à un utilisateur
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setActionType("discard")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="rounded-full bg-destructive/10 p-3">
                    <Trash2 className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">Mise au rebut</h3>
                    <p className="text-sm text-muted-foreground">
                      Retirer du stock
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {actionType && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-center text-muted-foreground">
                Fonctionnalité en cours d'implémentation
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {(movementType || actionType) && (
              <Button variant="outline" onClick={handleBack}>
                Retour
              </Button>
            )}
            <Button variant="ghost" onClick={handleClose} className="ml-auto">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
