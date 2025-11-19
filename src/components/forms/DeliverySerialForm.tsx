import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderLine } from "@/lib/mockData";
import { Plus, X, CalendarIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DeliverySerialFormProps {
  open: boolean;
  orderLines: OrderLine[];
  onConfirm: (
    serialNumbers: Record<string, string[]>, 
    renewalDates: Record<string, Date | undefined>,
    warrantyEndDates: Record<string, Date | undefined>
  ) => void;
  onCancel: () => void;
}

export const DeliverySerialForm = ({ open, orderLines, onConfirm, onCancel }: DeliverySerialFormProps) => {
  const [serialInputs, setSerialInputs] = useState<Record<string, string[]>>({});
  const [renewalDates, setRenewalDates] = useState<Record<string, Date | undefined>>({});
  const [warrantyEndDates, setWarrantyEndDates] = useState<Record<string, Date | undefined>>({});

  // Initialize serial inputs when orderLines change
  useEffect(() => {
    if (orderLines.length > 0) {
      const initial: Record<string, string[]> = {};
      orderLines.forEach(line => {
        initial[line.id] = Array(line.quantity).fill("");
      });
      setSerialInputs(initial);
    }
  }, [orderLines]);

  const updateSerial = (lineId: string, index: number, value: string) => {
    setSerialInputs(prev => ({
      ...prev,
      [lineId]: prev[lineId].map((serial, i) => i === index ? value : serial)
    }));
  };

  const addSerialInput = (lineId: string) => {
    setSerialInputs(prev => ({
      ...prev,
      [lineId]: [...prev[lineId], ""]
    }));
  };

  const removeSerialInput = (lineId: string, index: number) => {
    setSerialInputs(prev => ({
      ...prev,
      [lineId]: prev[lineId].filter((_, i) => i !== index)
    }));
  };

  const handleConfirm = () => {
    // Filter out empty serial numbers
    const cleanedSerials: Record<string, string[]> = {};
    Object.entries(serialInputs).forEach(([lineId, serials]) => {
      cleanedSerials[lineId] = serials.filter(s => s.trim() !== "");
    });
    onConfirm(cleanedSerials, renewalDates, warrantyEndDates);
  };

  const isValid = Object.values(serialInputs).some(serials => 
    serials.some(s => s.trim() !== "")
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Saisie des numéros de série</DialogTitle>
          <DialogDescription>
            Entrez les numéros de série des articles reçus pour cette livraison
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {orderLines.map(line => (
              <div key={line.id} className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{line.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantité commandée: {line.quantity}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSerialInput(line.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de fin de garantie (optionnel)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !warrantyEndDates[line.id] && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {warrantyEndDates[line.id] ? (
                            format(warrantyEndDates[line.id]!, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={warrantyEndDates[line.id]}
                          onSelect={(date) => setWarrantyEndDates(prev => ({ ...prev, [line.id]: date }))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Date de renouvellement prévu (optionnel)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !renewalDates[line.id] && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {renewalDates[line.id] ? (
                            format(renewalDates[line.id]!, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={renewalDates[line.id]}
                          onSelect={(date) => setRenewalDates(prev => ({ ...prev, [line.id]: date }))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  {serialInputs[line.id]?.map((serial, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`serial-${line.id}-${index}`} className="sr-only">
                          Numéro de série {index + 1}
                        </Label>
                        <Input
                          id={`serial-${line.id}-${index}`}
                          placeholder={`Numéro de série ${index + 1}`}
                          value={serial}
                          onChange={(e) => updateSerial(line.id, index, e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSerialInput(line.id, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Confirmer la livraison
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
