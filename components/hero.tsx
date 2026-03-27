"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { X } from "lucide-react"

export function Hero() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <section className="pt-[100px] min-h-screen flex flex-col md:flex-row">
        {/* Left — text content */}
        <div className="flex flex-col justify-center px-8 md:px-16 py-16 md:w-1/2 gap-6">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-accent">
            Joyería
          </p>
          <h1 className="font-sans text-5xl md:text-7xl leading-none text-balance text-foreground" style={{ letterSpacing: '-0.02em' }}>
            Tu estilo<br />
            <span className="italic font-light">siempre gana</span>
          </h1>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-xs">
            Pulseras Italianas, Charms y Collares. Joyería de moda inspirada en el estilo, la elegancia y los detalles que hacen única cada pieza.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="#products"
              className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3.5 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent hover:text-foreground transition-colors"
            >
              Ver colección
            </Link>
            <a
              href="https://wa.me/522463677293"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-foreground px-8 py-3.5 font-mono text-xs tracking-[0.2em] uppercase hover:bg-secondary transition-colors"
            >
              Contáctame
            </a>
          </div>
        </div>

        {/* Right — product showcase grid */}
        <div className="md:w-1/2 grid grid-cols-1 grid-rows-2 gap-px bg-border min-h-[80vw] md:min-h-0">
          <div
            className="relative overflow-hidden bg-secondary group cursor-pointer"
            onClick={() => setSelectedImage("/hero-1.jpeg")}
          >
            <Image
              src="/hero-1.jpeg"
              alt="Joyería Amanda - Colección principal"
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div
            className="relative overflow-hidden bg-secondary group cursor-pointer"
            onClick={() => setSelectedImage("/hero-2.jpeg")}
          >
            <Image
              src="/hero-2.jpeg"
              alt="Joyería Amanda - Colección principal"
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Popup / Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage}
              alt="Joyería Amanda - Imagen completa"
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  )
}
