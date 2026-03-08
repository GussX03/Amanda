"use client"

import Image from "next/image"
import { Plus, Check } from "lucide-react"
import { useState } from "react"
import { useCart } from "./cart-context"

const products = [
  {
    id: 1,
    name: "Collar de Conchas de Mar",
    price: 80,
    category: "Collares",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1sbjUmFRGxs21Syz3FwQcEOKCMMKHS.png",
    description: "Collar artesanal de conchas de mar naturales, tejido a mano.",
  },
  {
    id: 2,
    name: "Pulsera de Osos de Cristal",
    price: 65,
    category: "Pulseras",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B39vuI9l8YPLLZHD8nbWzZHWShN4T9.png",
    description: "Pulsera elástica con ositos de material de cristal en colores arcoíris.",
  },
  {
    id: 3,
    name: "Collar Oro Laminado · Dije de Concha",
    price: 150,
    category: "Collares",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9fa3XuJ9RFt0Q1dFvue9qQDc48IeVl.png",
    description: "Cadena fina de oro laminado con dije de concha de mar.",
  },
  {
    id: 4,
    name: "Pulsera Hilo Blanco · Ojo Turco",
    price: 50,
    category: "Pulseras",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FS4KDJddoRgTRjCNtyke8ZHWf364LE.png",
    description: "Pulsera de hilo blanco trenzado con cuentas doradas y ojo turco.",
  },
]

function ProductCard({ product }: { product: typeof products[0] }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article className="group flex flex-col bg-card">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-background/90 backdrop-blur-sm font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-1">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-sans text-lg leading-snug text-balance">{product.name}</h3>
          <p className="font-mono text-xs text-muted-foreground mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-sans text-xl">
            ${product.price}{" "}
            <span className="font-mono text-xs text-muted-foreground">MXN</span>
          </p>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
              added
                ? "bg-accent text-foreground"
                : "bg-foreground text-background hover:bg-accent hover:text-foreground"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check size={12} />
                Agregado
              </>
            ) : (
              <>
                <Plus size={12} />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductGrid() {
  const [activeFilter, setActiveFilter] = useState("Todos")
  const filters = ["Todos", "Collares", "Pulseras"]

  const filtered =
    activeFilter === "Todos"
      ? products
      : products.filter((p) => p.category === activeFilter)

  return (
    <section id="products" className="py-20 px-6 max-w-6xl mx-auto">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-accent mb-2">
            Colección
          </p>
          <h2 className="font-sans text-4xl md:text-5xl" style={{ letterSpacing: '-0.02em' }}>
            Nuestros productos
          </h2>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${
                activeFilter === f
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* CTA below */}
      <div className="mt-12 text-center">
        <p className="font-mono text-sm text-muted-foreground mb-4">
          ¿Buscas algo especial? Hacemos piezas personalizadas.
        </p>
        <a
          href="https://wa.me/522463677293?text=Hola%20Amanda%2C%20me%20gustar%C3%ADa%20una%20pieza%20personalizada"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-foreground px-8 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          Pedir personalizado
        </a>
      </div>
    </section>
  )
}
