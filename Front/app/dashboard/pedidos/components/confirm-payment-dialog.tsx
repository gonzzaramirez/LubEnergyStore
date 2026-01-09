"use client";

import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  User,
  Phone,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfirmPaymentDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmPaymentDialog({
  order,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: ConfirmPaymentDialogProps) {
  if (!order) return null;

  const customer = order.guestCustomer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Verificar datos antes de confirmar
          </DialogTitle>
          <DialogDescription>
            Por favor, verifica que los datos del pedido sean correctos antes de
            confirmar el pago. Se enviará un email de confirmación al cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alerta importante sobre el email */}
          <Alert className="border-yellow-500 bg-yellow-50">
            <Mail className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Importante:</strong> Se enviará un email de confirmación a{" "}
              <strong className="font-mono">{customer?.email}</strong>. Asegúrate
              de que este email sea correcto, ya que el cliente lo usará para
              ver el estado de su pedido y recibir el código de seguimiento.
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Información del pedido */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </h4>
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{formatPrice(order.totalAmount)}</span>
            </p>
          </div>

          <Separator />

          {/* Datos del cliente */}
          {customer && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos del Cliente
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="font-mono font-semibold text-base break-all">
                      {customer.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Se enviará la confirmación a este email
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nombre</p>
                      <p className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Dirección de envío
                    </p>
                    <p className="font-medium">
                      {customer.street}
                      {customer.apartment && `, ${customer.apartment}`}
                      <br />
                      {customer.city}, {customer.province}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Productos */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos ({order.items.length})
            </h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(item.quantity * item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 p-3 bg-primary/10 rounded-lg">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Notas del cliente */}
          {order.customerNotes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2 text-sm">Nota del cliente</h4>
                <p className="text-sm p-3 bg-secondary/30 rounded-lg">
                  {order.customerNotes}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              "Confirmando..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar pago y enviar email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
