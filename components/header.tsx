"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { CartDrawer } from "./cart-drawer"

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top announcement bar */}
      <div className="bg-foreground text-background text-center py-2 font-mono text-[10px] tracking-[0.2em] uppercase">
        Envíos a todo México · Pago por WhatsApp o efectivo
      </div>

      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          <Link
            href="#products"
            className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Tienda
          </Link>
          <Link
            href="#contact"
            className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Contacto
          </Link>
        </nav>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label="AMANDA Home">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vIc7d77Mxciq8SIMP9l1xgruIEHbYn.png"
            alt="AMANDA"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <CartDrawer />
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-background border-t border-border px-6 py-4 flex flex-col gap-4" aria-label="Mobile navigation">
          <Link
            href="#products"
            className="font-mono text-xs tracking-[0.2em] uppercase text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Tienda
          </Link>
          <Link
            href="#contact"
            className="font-mono text-xs tracking-[0.2em] uppercase text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Contacto
          </Link>
        </nav>
      )}
    </header>
  )
}
