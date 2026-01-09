"use client";

import { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Package,
  Truck,
  Calendar,
  FileText,
} from "lucide-react";

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }
> = {
  PENDING: { label: "Pendiente", variant: "outline", color: "text-yellow-600" },
  CONFIRMED: { label: "Confirmado", variant: "default", color: "text-green-600" },
  SHIPPED: { label: "Enviado", variant: "secondary", color: "text-blue-600" },
  DELIVERED: { label: "Entregado", variant: "default", color: "text-green-700" },
  CANCELLED: { label: "Cancelado", variant: "destructive", color: "text-red-600" },
};

function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const customer = order.guestCustomer;
  const config = statusConfig[order.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <span className="font-mono">
                Pedido #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <Badge variant={config.variant}>{config.label}</Badge>
            </DialogTitle>
          </div>
          <DialogDescription>
            Creado el {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className={`p-3 rounded-lg bg-secondary/50 ${order.status !== "CANCELLED" ? "border-2 border-green-500" : ""}`}>
              <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Creado</p>
              <p className="text-xs font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className={`p-3 rounded-lg bg-secondary/50 ${order.confirmedAt ? "border-2 border-green-500" : ""}`}>
              <CreditCard className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Confirmado</p>
              <p className="text-xs font-medium">{formatDate(order.confirmedAt)}</p>
            </div>
            <div className={`p-3 rounded-lg bg-secondary/50 ${order.shippedAt ? "border-2 border-green-500" : ""}`}>
              <Truck className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Enviado</p>
              <p className="text-xs font-medium">{formatDate(order.shippedAt)}</p>
            </div>
            <div className={`p-3 rounded-lg bg-secondary/50 ${order.deliveredAt ? "border-2 border-green-500" : ""}`}>
              <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Entregado</p>
              <p className="text-xs font-medium">{formatDate(order.deliveredAt)}</p>
            </div>
          </div>

          <Separator />

          {/* Cliente */}
          {customer && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos del Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {customer.firstName} {customer.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {customer.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>DNI: {customer.dni}</span>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {customer.street}
                    {customer.apartment && `, ${customer.apartment}`}
                    <br />
                    {customer.city}, {customer.province}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Productos */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos
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

          {/* Tracking */}
          {order.trackingCode && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Información de Envío
                </h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {order.courierName || "Transportadora"}
                  </p>
                  <p className="text-lg font-mono font-bold text-blue-700">
                    {order.trackingCode}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Notas */}
          {(order.customerNotes || order.adminNotes) && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notas
                </h4>
                {order.customerNotes && (
                  <div className="p-3 bg-secondary/30 rounded-lg mb-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Nota del cliente:
                    </p>
                    <p className="text-sm">{order.customerNotes}</p>
                  </div>
                )}
                {order.adminNotes && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Nota interna:
                    </p>
                    <p className="text-sm">{order.adminNotes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
