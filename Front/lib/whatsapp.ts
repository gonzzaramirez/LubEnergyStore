import type { CartItem } from "@/context/cart-context"
import { formatPrice } from "./products"

interface CustomerData {
  name: string
  address: string
  notes?: string
}

export function generateWhatsAppMessage(items: CartItem[], total: number, customer: CustomerData): string {
  const productLines = items
    .map((item) => `• ${item.quantity}x ${item.name} - ${formatPrice(item.price)} c/u`)
    .join("\n")

  const message = `🛒 *Nuevo Pedido - LUB ENERGY*
━━━━━━━━━━━━━━━━━━━━

📦 *Productos:*
${productLines}

━━━━━━━━━━━━━━━━━━━━
💰 *Total: ${formatPrice(total)}*

👤 *Nombre:* ${customer.name}
📍 *Dirección:* ${customer.address}
${customer.notes ? `📝 *Notas:* ${customer.notes}` : ""}`

  return encodeURIComponent(message.trim())
}

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "")
  return `https://wa.me/${cleanPhone}?text=${message}`
}
