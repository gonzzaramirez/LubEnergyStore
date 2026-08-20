import type { CartItem } from "@/context/cart-context"
import { formatPrice } from "./products"

// Mensaje mínimo de WhatsApp: solo líneas de producto (título + precio
// unitario) y el total. Sin ID, sin link, sin datos del comprador, sin notas.
export function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
): string {
  const productLines = items
    .map((item) => `${item.name} - ${formatPrice(item.price)}`)
    .join("\n")

  const message = `*PEDIDO LUB ENERGY*

${productLines}

*Total: ${formatPrice(total)}*`

  return encodeURIComponent(message.trim())
}

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "")
  return `https://wa.me/${cleanPhone}?text=${message}`
}
