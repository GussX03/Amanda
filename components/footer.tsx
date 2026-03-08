import Image from "next/image"

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Contact CTA band */}
      <div className="border-b border-background/10 px-6 py-16 max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/50">
            Instagram
          </p>
          <a
            href="https://www.instagram.com/amanda._oficial_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <span className="text-background/70 group-hover:text-background transition-colors">
              <InstagramIcon />
            </span>
            <span className="font-sans text-xl group-hover:text-background/70 transition-colors">
              @amanda._oficial_
            </span>
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/50">
            WhatsApp
          </p>
          <a
            href="https://wa.me/522463677293"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <span className="text-background/70 group-hover:text-background transition-colors">
              <WhatsAppIcon />
            </span>
            <span className="font-sans text-xl group-hover:text-background/70 transition-colors">
              +52 246 367 7293
            </span>
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/50">
            Correo
          </p>
          <a
            href="mailto:amanda_oficial_@outlook.com"
            className="flex items-center gap-3 group"
          >
            <span className="text-background/70 group-hover:text-background transition-colors">
              <MailIcon />
            </span>
            <span className="font-sans text-lg break-all group-hover:text-background/70 transition-colors">
              amanda_oficial_@outlook.com
            </span>
          </a>
        </div>
      </div>

      {/* Order CTA */}
      <div className="px-6 py-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-background/50 mb-1">
            ¿Lista para ordenar?
          </p>
          <p className="font-sans text-2xl text-balance">
            Escríbenos por WhatsApp o Instagram
          </p>
        </div>
        <a
          href="https://wa.me/522463677293?text=Hola%20Amanda%2C%20me%20gustar%C3%ADa%20hacer%20un%20pedido"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-background text-foreground px-8 py-3.5 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent transition-colors"
        >
          <WhatsAppIcon />
          Ordenar ahora
        </a>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 max-w-6xl mx-auto">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vIc7d77Mxciq8SIMP9l1xgruIEHbYn.png"
          alt="AMANDA"
          width={80}
          height={26}
          className="h-6 w-auto brightness-0 invert opacity-60"
        />
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-background/40">
          © {new Date().getFullYear()} Amanda. Joyería artesanal hecha con amor.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/amanda._oficial_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Amanda en Instagram"
            className="text-background/50 hover:text-background transition-colors"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://wa.me/522463677293"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            className="text-background/50 hover:text-background transition-colors"
          >
            <WhatsAppIcon />
          </a>
          <a
            href="mailto:amanda_oficial_@outlook.com"
            aria-label="Enviar correo a Amanda"
            className="text-background/50 hover:text-background transition-colors"
          >
            <MailIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}
