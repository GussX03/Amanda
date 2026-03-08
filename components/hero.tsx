import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="pt-[100px] min-h-screen flex flex-col md:flex-row">
      {/* Left — text content */}
      <div className="flex flex-col justify-center px-8 md:px-16 py-16 md:w-1/2 gap-6">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-accent">
          Joyería Artesanal
        </p>
        <h1 className="font-sans text-5xl md:text-7xl leading-none text-balance text-foreground" style={{ letterSpacing: '-0.02em' }}>
          Piezas únicas,<br />
          <span className="italic font-light">hechas con amor</span>
        </h1>
        <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-xs">
          Collares, pulseras y accesorios artesanales. Cada pieza es única y elaborada a mano.
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
      <div className="md:w-1/2 grid grid-cols-2 gap-px bg-border min-h-[60vw] md:min-h-0">
        <div className="relative overflow-hidden bg-secondary group">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1sbjUmFRGxs21Syz3FwQcEOKCMMKHS.png"
            alt="Collar de conchas de mar"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="relative overflow-hidden bg-secondary group">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9fa3XuJ9RFt0Q1dFvue9qQDc48IeVl.png"
            alt="Collar de oro laminado con dije de concha"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="relative overflow-hidden bg-secondary group">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FS4KDJddoRgTRjCNtyke8ZHWf364LE.png"
            alt="Pulsera de hilo blanco con ojo turco"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="relative overflow-hidden bg-secondary group">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B39vuI9l8YPLLZHD8nbWzZHWShN4T9.png"
            alt="Pulsera de osos de cristal"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </div>
    </section>
  )
}
