"use client"

import Image from "next/image"
import { useCopyToast } from "./copy-toast"

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
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
  const { copyToClipboard } = useCopyToast()
  const suggestedMessage = `Hola, quiero información sobre el servicio`
  const encodedMessage = encodeURIComponent(suggestedMessage)
  const instagramProfile = "https://www.instagram.com/amanda._oficial_"

  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Contact CTA band */}
      <div className="border-b border-background/10 px-6 py-16 max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/50">
            Instagram
          </p>
          <a
            href={instagramProfile}
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
            Mensaje sugerido
          </p>
          <div className="flex items-center gap-3 group">
            <span className="font-sans text-lg">"{suggestedMessage}"</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(suggestedMessage)}
                className="inline-flex items-center justify-center border border-foreground px-3 py-2 font-mono text-xs tracking-[0.2em] uppercase hover:bg-secondary transition-colors"
              >
                Copiar mensaje
              </button>
              <a
                href={instagramProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-background text-foreground px-4 py-2 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent transition-colors"
              >
                Abrir Instagram
              </a>
            </div>
          </div>
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
            Escríbenos por Instagram
          </p>
        </div>
        <a
          href={instagramProfile}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-background text-foreground px-8 py-3.5 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent transition-colors"
        >
          <InstagramIcon />
          Abrir Instagram
        </a>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 max-w-6xl mx-auto">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vIc7d77Mxciq8SIMP9l1xgruIEHbYn.png"
          alt="AMANDA"
          width={140}
          height={46}
          className="h-10 w-auto opacity-60"
        />
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-background/40">
          © {new Date().getFullYear()} Amanda. Joyería artesanal hecha con amor.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={instagramProfile}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Amanda en Instagram"
            className="text-background/50 hover:text-background transition-colors"
          >
            <InstagramIcon />
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
