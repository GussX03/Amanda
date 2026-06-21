"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { CartTrigger } from "./cart-drawer"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top announcement bar */}
      <div className="bg-foreground px-4 py-2 text-center">
        <p className="mx-auto max-w-xs font-mono text-[9px] leading-relaxed tracking-[0.28em] uppercase text-background sm:max-w-none sm:text-[10px] sm:tracking-[0.2em]">
          Envíos a todo México · Contáctanos por Instagram
        </p>
      </div>

      <div className="relative flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 max-w-6xl mx-auto">
        {/* Mobile menu button */}
        <button
          className="md:hidden flex h-10 w-10 items-center justify-center text-foreground"
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
            width={250}
            height={84}
            className="h-9 w-auto object-contain dark:invert sm:h-14"
            priority
          />
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <CartTrigger />
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-background border-t border-border px-4 py-4 flex flex-col gap-3" aria-label="Mobile navigation">
          <Link
            href="#products"
            className="font-mono text-[11px] tracking-[0.22em] uppercase text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Tienda
          </Link>
          <Link
            href="#contact"
            className="font-mono text-[11px] tracking-[0.22em] uppercase text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Contacto
          </Link>
        </nav>
      )}
    </header>
  )
}
