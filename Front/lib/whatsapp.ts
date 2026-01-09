import type { CartItem } from "@/context/cart-context"
import { formatPrice } from "./products"

interface CustomerData {
  name: string
  address: string
  notes?: string
  email?: string
  phone?: string
  dni?: string
  orderId?: string
  discountCode?: string
  discountPercent?: number
}

export function generateWhatsAppMessage(items: CartItem[], total: number, customer: CustomerData): string {
  const productLines = items
    .map((item) => `• ${item.quantity}x ${item.name} - ${formatPrice(item.price)} c/u`)
    .join("\n")

  let message = `🛒 *Nuevo Pedido - LUB ENERGY*
━━━━━━━━━━━━━━━━━━━━`

  if (customer.orderId) {
    message += `
🔖 *Pedido #${customer.orderId}*`
  }

  message += `

📦 *Productos:*
${productLines}

━━━━━━━━━━━━━━━━━━━━`

  // Agregar descuento si existe
  if (customer.discountCode && customer.discountPercent) {
    message += `
🏷️ *Código:* ${customer.discountCode} (-${customer.discountPercent}%)`
  }

  message += `
💰 *Total: ${formatPrice(total)}*

👤 *Cliente:* ${customer.name}`

  if (customer.dni) {
    message += `
🪪 *DNI:* ${customer.dni}`
  }

  if (customer.email) {
    message += `
📧 *Email:* ${customer.email}`
  }

  if (customer.phone) {
    message += `
📞 *Teléfono:* ${customer.phone}`
  }

  message += `
📍 *Dirección:* ${customer.address}`

  if (customer.notes) {
    message += `

📝 *Notas:* ${customer.notes}`
  }

  return encodeURIComponent(message.trim())
}

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "")
  return `https://wa.me/${cleanPhone}?text=${message}`
}
