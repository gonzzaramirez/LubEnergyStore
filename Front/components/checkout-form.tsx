"use client";

import type React from "react";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/products";
import { generateWhatsAppMessage, createWhatsAppUrl } from "@/lib/whatsapp";
import { createOrder } from "@/lib/api/order";

interface AppliedDiscount {
  code: string;
  discountPercent: number;
}

interface CheckoutFormProps {
  onBack: () => void;
  appliedDiscount?: AppliedDiscount | null;
}

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_WA_NUMBER || "543795056878";

export function CheckoutForm({ onBack, appliedDiscount }: CheckoutFormProps) {
  const { items, totalPrice, clearCart, setIsOpen } = useCart();

  const discountAmount = appliedDiscount
    ? Math.round(totalPrice * (appliedDiscount.discountPercent / 100))
    : 0;
  const finalTotal = totalPrice - discountAmount;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmpty = items.length === 0;

  const handleConfirm = async () => {
    if (isEmpty || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Crear la orden en el backend (sin datos del comprador)
      await createOrder({
        items: items.map((item) => ({
          productId: item.id,
          flavorId: item.flavorId,
          productName: item.name,
          flavorName: item.flavorName,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        totalAmount: finalTotal,
      });

      // 2. Abrir WhatsApp con el mensaje mínimo
      const message = generateWhatsAppMessage(items, finalTotal);
      window.location.assign(createWhatsAppUrl(WHATSAPP_NUMBER, message));

      // 3. Limpiar el carrito
      clearCart();
      setIsOpen(false);
    } catch (error) {
      // Aun si falla el guardado, abrimos WhatsApp para no perder el pedido
      const message = generateWhatsAppMessage(items, finalTotal);
      window.location.assign(createWhatsAppUrl(WHATSAPP_NUMBER, message));
      clearCart();
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Back Button */}
      <div className="border-b border-border p-4 bg-background">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {/* Order Summary */}
          <div className="border-b border-border bg-secondary/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Resumen del pedido ({items.length}{" "}
              {items.length === 1 ? "producto" : "productos"})
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap ml-2">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-bold text-primary">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>

          {/* Confirm */}
          <div className="p-4 pb-10 space-y-4">
            <p className="text-sm text-muted-foreground">
              Al confirmar se crea tu pedido y se abre WhatsApp para coordinar
              el pago con nuestro equipo.
            </p>

            <Button
              onClick={handleConfirm}
              disabled={isEmpty || isSubmitting}
              size="lg"
              className="w-full gap-2 bg-green-600 text-base font-semibold hover:bg-green-700 shadow-xl shadow-green-900/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Confirmar y enviar por WhatsApp
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
