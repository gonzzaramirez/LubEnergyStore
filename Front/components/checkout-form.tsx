"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/products"
import { generateWhatsAppMessage, createWhatsAppUrl } from "@/lib/whatsapp"

interface CheckoutFormProps {
  onBack: () => void
}

const WHATSAPP_NUMBER = "5491112345678" // Número de WhatsApp del comercio

export function CheckoutForm({ onBack }: CheckoutFormProps) {
  const { items, totalPrice, clearCart, setIsOpen } = useCart()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) return

    setIsSubmitting(true)

    const message = generateWhatsAppMessage(items, totalPrice, {
      name: name.trim(),
      address: address.trim(),
      notes: notes.trim() || undefined,
    })

    const whatsappUrl = createWhatsAppUrl(WHATSAPP_NUMBER, message)

    // Open WhatsApp
    window.open(whatsappUrl, "_blank")

    // Clear cart and close sidebar after a brief delay
    setTimeout(() => {
      clearCart()
      setIsOpen(false)
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Back Button */}
      <div className="border-b border-border p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </button>
      </div>

      {/* Order Summary */}
      <div className="border-b border-border bg-secondary/30 p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Resumen del pedido</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.quantity}x {item.name}
              </span>
              <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-bold text-primary">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col p-4">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              className="bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección de envío *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, localidad"
              required
              className="bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Indicaciones especiales, horarios, etc."
              rows={3}
              className="bg-secondary/50 resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={!name.trim() || !address.trim() || isSubmitting}
          className="mt-6 w-full gap-2 bg-green-600 text-base font-semibold hover:bg-green-700"
        >
          <MessageCircle className="h-5 w-5" />
          {isSubmitting ? "Abriendo WhatsApp..." : "Enviar pedido por WhatsApp"}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Se abrirá WhatsApp con tu pedido listo para enviar
        </p>
      </form>
    </div>
  )
}
