"use client"

import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { CheckoutForm } from "./checkout-form"
import { useState } from "react"

export function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

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
          <CheckoutForm onBack={() => setShowCheckout(false)} />
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
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
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
              <div className="border-t border-border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
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
