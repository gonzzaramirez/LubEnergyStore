"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Truck } from "lucide-react";

interface TrackingDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (trackingCode: string, courierName?: string) => Promise<void>;
}

export function TrackingDialog({
  order,
  open,
  onOpenChange,
  onSubmit,
}: TrackingDialogProps) {
  const [trackingCode, setTrackingCode] = useState("");
  const [courierName, setCourierName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(trackingCode.trim(), courierName.trim() || undefined);
      setTrackingCode("");
      setCourierName("");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Agregar código de seguimiento
          </DialogTitle>
          <DialogDescription>
            Pedido #{order.id.slice(0, 8).toUpperCase()} - Se enviará un email
            al cliente con esta información.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trackingCode">Código de seguimiento *</Label>
            <Input
              id="trackingCode"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ej: OCA123456789AR"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courierName">Transportadora (opcional)</Label>
            <Input
              id="courierName"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="Ej: OCA, Andreani, Correo Argentino"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!trackingCode.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Guardar y notificar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
