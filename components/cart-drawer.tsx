"use client"

import Image from "next/image"
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react"
import { useCart } from "./cart-context"
import { useCopyToast } from "./copy-toast"

/* ─── Trigger button — lives inside the header ─────────────────────────── */
export function CartTrigger() {
  const { totalItems, openDrawer } = useCart()

  return (
    <button
      onClick={openDrawer}
      className="relative flex items-center text-foreground hover:text-accent transition-colors"
      aria-label={`Carrito de compras, ${totalItems} artículos`}
    >
      <ShoppingBag size={20} strokeWidth={1.5} />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {totalItems}
        </span>
      )}
    </button>
  )
}

/* ─── Drawer panel — rendered at root level, outside any fixed ancestor ── */
export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, drawerOpen, closeDrawer } = useCart()
  const { copyToClipboard } = useCopyToast()

  const suggestedMessage = `Hola, quiero información sobre el servicio\n\nPedido:\n${items
    .map((i) => `- ${i.name} x${i.quantity} = $${(i.price * i.quantity).toFixed(2)} MXN`)
    .join("\n")}\n\nTotal: $${totalPrice.toFixed(2)} MXN`
  const instagramProfile = "https://www.instagram.com/amandaaa_mx?igsh=d2VlNGNmMjVmbm42&utm_source=qr"

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-card z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-sans text-xl tracking-[0.18em] uppercase">
            Carrito {totalItems > 0 && <span className="font-mono text-sm text-muted-foreground">({totalItems})</span>}
          </h2>
          <button
            onClick={closeDrawer}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag size={48} strokeWidth={0.8} className="text-border" />
              <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-5 border-b border-border last:border-0">
                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-secondary">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-sans text-sm leading-snug">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="font-mono text-sm w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <p className="font-mono text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6 space-y-4 bg-card">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Total</span>
              <span className="font-sans text-2xl">${totalPrice.toFixed(2)} MXN</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(suggestedMessage)}
                className="w-full inline-flex items-center justify-center gap-2 bg-background text-foreground py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent transition-colors"
              >
                Copiar mensaje
              </button>

              <a
                href={instagramProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 border border-foreground py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
              >
                Abrir Instagram
              </a>
            </div>

            <p className="text-center text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              Te contactaremos por Instagram para coordinar el pago y envío
            </p>
          </div>
        )}
      </div>
    </>
  )
}
