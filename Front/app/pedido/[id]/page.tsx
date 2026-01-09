import { getOrderPublic } from "@/lib/api/order";
import { OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import {
  Package,
  CheckCircle,
  Truck,
  Home,
  Clock,
  XCircle,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusSteps = [
  { status: "PENDING", label: "Pedido recibido", icon: Clock },
  { status: "CONFIRMED", label: "Pago confirmado", icon: CheckCircle },
  { status: "SHIPPED", label: "En camino", icon: Truck },
  { status: "DELIVERED", label: "Entregado", icon: Home },
];

const statusIndex: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const { id } = await params;

  let order;
  try {
    order = await getOrderPublic(id);
  } catch {
    notFound();
  }

  const currentStep = statusIndex[order.status];
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Seguimiento de pedido
          </h1>
          <p className="text-muted-foreground">
            Pedido{" "}
            <span className="font-mono font-semibold text-foreground">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </p>
        </div>

        {/* Estado cancelado */}
        {isCancelled && (
          <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Pedido cancelado
            </h2>
            <p className="text-muted-foreground">
              Este pedido ha sido cancelado. Si tenés dudas, contactanos por
              WhatsApp.
            </p>
          </div>
        )}

        {/* Timeline de estado */}
        {!isCancelled && (
          <div className="mb-8 p-6 bg-card rounded-xl border shadow-sm">
            <div className="relative">
              {/* Línea de progreso */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-secondary mx-8">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div
                      key={step.status}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center
                          transition-all duration-300 z-10
                          ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }
                          ${isCurrent ? "ring-4 ring-primary/30" : ""}
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`
                          mt-3 text-xs md:text-sm font-medium text-center
                          ${isCompleted ? "text-foreground" : "text-muted-foreground"}
                        `}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mensaje de estado actual */}
            <div className="mt-6 pt-6 border-t text-center">
              {currentStep === 0 && (
                <p className="text-muted-foreground">
                  Tu pedido fue recibido. Estamos esperando la confirmación del
                  pago.
                </p>
              )}
              {currentStep === 1 && (
                <p className="text-muted-foreground">
                  ¡Pago confirmado! Estamos preparando tu pedido para el envío.
                </p>
              )}
              {currentStep === 2 && (
                <p className="text-muted-foreground">
                  Tu pedido está en camino. ¡Pronto lo recibirás!
                </p>
              )}
              {currentStep === 3 && (
                <p className="text-green-600 font-medium">
                  ¡Tu pedido fue entregado! Gracias por tu compra.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Código de seguimiento */}
        {order.trackingCode && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Código de seguimiento
              </h3>
            </div>
            <p className="text-2xl font-mono font-bold text-blue-700 dark:text-blue-300 mb-2">
              {order.trackingCode}
            </p>
            {order.courierName && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Enviado por: {order.courierName}
              </p>
            )}
          </div>
        )}

        {/* Resumen del pedido */}
        <div className="p-6 bg-card rounded-xl border shadow-sm mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Resumen del pedido
          </h3>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">
                  {formatPrice(item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-semibold text-lg">Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-card rounded-xl border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Envío a</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.customerName}
              <br />
              {order.city}
            </p>
          </div>

          <div className="p-4 bg-card rounded-xl border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Fecha del pedido</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            ¿Tenés alguna consulta sobre tu pedido?
          </p>
          <a
            href="https://wa.me/3775439981"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
