"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { X } from "lucide-react"
import { getHeroGalleryCache, listHeroGallery, setHeroGalleryCache } from "@/lib/api"
import type { HeroGalleryConfig, HeroGalleryPhoto } from "@/lib/types"

const FALLBACK_HERO_IMAGES = [
  {
    id_foto: "fallback-1",
    foto: "/hero-1.jpeg",
    orden: 1,
    activo: true,
    position_x: 50,
    position_y: 50,
  },
  {
    id_foto: "fallback-2",
    foto: "/hero-2.jpeg",
    orden: 2,
    activo: true,
    position_x: 50,
    position_y: 50,
  },
] satisfies HeroGalleryPhoto[]

const DEFAULT_HERO_CONFIG: HeroGalleryConfig = {
  aspect_ratio: "4:5",
}

function aspectRatioValue(ratio: string) {
  const [width, height] = ratio.split(":").map(Number)
  if (!width || !height) return "4 / 5"
  return `${width} / ${height}`
}

export function Hero() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<HeroGalleryPhoto[]>([])
  const [heroConfig, setHeroConfig] = useState<HeroGalleryConfig>(DEFAULT_HERO_CONFIG)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    loop: true,
  })

  useEffect(() => {
    const cached = getHeroGalleryCache()
    if (cached?.hero_fotos) {
      setGalleryImages(cached.hero_fotos)
    }
    if (cached?.hero_config) {
      setHeroConfig(cached.hero_config)
    }

    let cancelled = false

    async function loadGallery() {
      try {
        const res = await listHeroGallery()
        if (!cancelled && res.status === "success") {
          setGalleryImages(res.hero_fotos ?? [])
          setHeroConfig(res.hero_config ?? DEFAULT_HERO_CONFIG)
          setHeroGalleryCache(res)
        }
      } catch {
        if (!cancelled && !cached?.hero_fotos) {
          setGalleryImages([])
          setHeroConfig(DEFAULT_HERO_CONFIG)
        }
      }
    }

    loadGallery()
    return () => {
      cancelled = true
    }
  }, [])

  const activeImages = useMemo(() => {
    const validImages = galleryImages
      .filter((image) => image.activo && image.foto)
      .sort((a, b) => a.orden - b.orden || a.id_foto.localeCompare(b.id_foto))

    return validImages.length > 0 ? validImages : FALLBACK_HERO_IMAGES
  }, [galleryImages])

  const ratioStyle = useMemo(
    () => ({ aspectRatio: aspectRatioValue(heroConfig.aspect_ratio || DEFAULT_HERO_CONFIG.aspect_ratio) }),
    [heroConfig.aspect_ratio]
  )

  useEffect(() => {
    if (!emblaApi || activeImages.length <= 1) return

    const autoplay = window.setInterval(() => {
      emblaApi.scrollPrev()
    }, 3600)

    return () => window.clearInterval(autoplay)
  }, [emblaApi, activeImages.length])

  const renderHeroImage = (image: HeroGalleryPhoto) => (
    <button
      key={image.id_foto}
      type="button"
      className="group relative w-full overflow-hidden bg-secondary text-left"
      style={ratioStyle}
      onClick={() => setSelectedImage(image.foto)}
      aria-label="Ver foto completa"
    >
      <Image
        src={image.foto}
        alt="Joyería & Relojería Amanda - Colección principal"
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        style={{ objectPosition: `${image.position_x}% ${image.position_y}%` }}
        sizes="(max-width: 640px) 74vw, (max-width: 1024px) 42vw, 28vw"
      />
    </button>
  )

  return (
    <>
      <section className="flex min-h-screen flex-col pt-[88px] sm:pt-[100px] md:flex-row">
        <div className="flex flex-col justify-center gap-5 px-4 py-10 sm:px-8 sm:py-16 md:w-1/2 md:gap-6 md:px-16">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-accent">
            Joyería & Relojería
          </p>
          <h1 className="max-w-[12ch] font-sans text-4xl leading-none text-balance text-foreground sm:text-5xl md:text-7xl" style={{ letterSpacing: "-0.02em" }}>
            Tu estilo<br />
            <span className="italic font-light">siempre gana</span>
          </h1>
          <p className="max-w-sm font-mono text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
            Pulseras italianas, charms y relojes inspirados en una visión contemporánea del estilo y la elegancia.
            <br />
            Una colección de joyería de moda diseñada para destacar a través de detalles únicos y acabados limpios.
          </p>
          <div className="mt-1 flex flex-col gap-3 sm:mt-2 sm:flex-row">
            <Link
              href="#products"
              className="inline-flex min-h-12 items-center justify-center bg-foreground px-6 py-3.5 text-center font-mono text-[11px] tracking-[0.22em] uppercase text-background transition-colors hover:bg-accent hover:text-foreground sm:px-8 sm:text-xs sm:tracking-[0.2em]"
            >
              Ver colección
            </Link>
            <a
              href="https://www.instagram.com/amanda._oficial_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center border border-foreground px-6 py-3.5 text-center font-mono text-[11px] tracking-[0.22em] uppercase transition-colors hover:bg-secondary sm:px-8 sm:text-xs sm:tracking-[0.2em]"
            >
              Contáctame
            </a>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-8 sm:pb-8 md:flex md:w-1/2 md:items-center md:justify-center md:px-0 md:pb-0">
          <div className="w-full md:pr-8">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="-ml-3 flex touch-pan-y sm:-ml-4">
                {activeImages.map((image) => (
                  <div
                    key={image.id_foto}
                    className={`min-w-0 flex-[0_0_78%] pl-3 sm:flex-[0_0_52%] sm:pl-4 lg:flex-[0_0_48%] ${
                      activeImages.length === 1 ? "md:flex-[0_0_72%]" : ""
                    }`}
                  >
                    {renderHeroImage(image)}
                  </div>
                ))}
              </div>
            </div>

            {activeImages.length > 1 && (
              <p className="mt-3 px-1 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Desliza para ver más
              </p>
            )}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in duration-200 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-[90vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
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
