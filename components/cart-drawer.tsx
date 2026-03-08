"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react"
import { useCart } from "./cart-context"
import { cn } from "@/lib/utils"

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  const whatsappMessage = encodeURIComponent(
    `Hola Amanda! Me interesa hacer un pedido:\n${items
      .map((i) => `- ${i.name} x${i.quantity} = $${(i.price * i.quantity).toFixed(2)} MXN`)
      .join("\n")}\n\nTotal: $${totalPrice.toFixed(2)} MXN`
  )
  const whatsappUrl = `https://wa.me/522463677293?text=${whatsappMessage}`

  return (
    <>
      {/* Cart trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1 text-foreground hover:text-accent transition-colors"
        aria-label={`Shopping cart, ${totalItems} items`}
      >
        <ShoppingBag size={20} strokeWidth={1.5} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-card z-50 flex flex-col shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-sans text-xl tracking-[0.15em] uppercase">
            Carrito
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <ShoppingBag size={40} strokeWidth={1} className="text-border" />
              <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 py-3 border-b border-border last:border-0">
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-secondary">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <p className="font-sans text-sm leading-snug text-balance pr-2">{item.name}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <p className="font-mono text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Total</span>
              <span className="font-sans text-xl">${totalPrice.toFixed(2)} MXN</span>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-foreground text-background py-3.5 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent hover:text-foreground transition-colors"
            >
              Ordenar por WhatsApp
            </a>
            <p className="text-center text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              Te contactaremos para coordinar el pago y envío
            </p>
          </div>
        )}
      </div>
    </>
  )
}
