"use client"

import { X, Minus, Plus, Trash2, ShoppingBag, Ticket, Loader2, Check } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckoutForm } from "./checkout-form"
import { useState } from "react"
import { validateDiscountCode } from "@/lib/api/discount-code"
import { toast } from "sonner"

interface AppliedDiscount {
  code: string
  discountPercent: number
}

export function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Ingresa un código de descuento")
      return
    }

    try {
      setIsValidating(true)
      const result = await validateDiscountCode(discountCode.trim(), totalPrice)
      setAppliedDiscount({
        code: result.code,
        discountPercent: result.discountPercent,
      })
      setDiscountCode("")
      toast.success(`¡Código aplicado! ${result.discountPercent}% de descuento`)
    } catch (error: any) {
      toast.error(error.message || "Código no válido")
    } finally {
      setIsValidating(false)
    }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    toast.info("Código de descuento eliminado")
  }

  // Calcular el total con descuento
  const discountAmount = appliedDiscount
    ? Math.round(totalPrice * (appliedDiscount.discountPercent / 100))
    : 0
  const finalTotal = totalPrice - discountAmount

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          setIsOpen(false)
          setShowCheckout(false)
        }}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {showCheckout ? "Finalizar compra" : "Tu carrito"}
            </h2>
          </div>
          <button
            onClick={() => {
              setIsOpen(false)
              setShowCheckout(false)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showCheckout ? (
          <CheckoutForm 
            onBack={() => setShowCheckout(false)} 
            appliedDiscount={appliedDiscount}
          />
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
                  <p className="text-lg font-medium text-foreground">Tu carrito está vacío</p>
                  <p className="mt-1 text-sm text-muted-foreground">Agregá productos para comenzar</p>
                  <Button onClick={() => setIsOpen(false)} className="mt-6">
                    Ver productos
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-950 p-2">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h4 className="font-medium text-foreground line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-primary">{formatPrice(item.price)}</p>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Código de descuento */}
                <div className="space-y-2">
                  {appliedDiscount ? (
                    <div className="flex items-center justify-between rounded-lg bg-green-500/10 p-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-500">
                          {appliedDiscount.code} (-{appliedDiscount.discountPercent}%)
                        </span>
                      </div>
                      <button
                        onClick={removeDiscount}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Código de descuento"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        className="h-9 text-sm uppercase"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyDiscount()
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyDiscount}
                        disabled={isValidating}
                        className="h-9 px-3"
                      >
                        {isValidating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Ticket className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-500">Descuento</span>
                      <span className="text-green-500">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button
                  className="w-full green-glow text-base font-semibold"
                  size="lg"
                  onClick={() => setShowCheckout(true)}
                >
                  Confirmar pedido
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
