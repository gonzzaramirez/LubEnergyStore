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
    .map((item) => `${item.quantity}x ${item.name} - ${formatPrice(item.price)}`)
    .join("\n")

  let message = `*PEDIDO LUB ENERGY*`

  if (customer.orderId) {
    message += ` #${customer.orderId}`
  }

  message += `

${productLines}`

  if (customer.discountCode && customer.discountPercent) {
    message += `

Descuento: ${customer.discountCode} (-${customer.discountPercent}%)`
  }

  message += `

*Total: ${formatPrice(total)}*

---
*${customer.name}*`

  if (customer.phone) {
    message += ` | ${customer.phone}`
  }

  if (customer.dni) {
    message += `
DNI: ${customer.dni}`
  }

  message += `
${customer.address}`

  if (customer.notes) {
    message += `

_${customer.notes}_`
  }

  return encodeURIComponent(message.trim())
}

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "")
  return `https://wa.me/${cleanPhone}?text=${message}`
}
