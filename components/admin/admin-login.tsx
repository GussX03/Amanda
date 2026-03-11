"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, LogIn, ArrowLeft, RefreshCw } from "lucide-react"

interface AdminLoginProps {
  onLogin: (user: string, password: string) => boolean
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      const ok = onLogin(user.trim().toLowerCase(), password)
      if (!ok) setError("Usuario o contraseña incorrectos")
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative items-center justify-center overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)`,
        }} />
        <div className="relative z-10 flex flex-col items-center gap-8 px-12">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vIc7d77Mxciq8SIMP9l1xgruIEHbYn.png"
            alt="AMANDA"
            width={280}
            height={93}
            className="h-20 w-auto opacity-90"
          />
          <div className="w-12 h-px bg-background/20" />
          <p className="font-sans text-2xl text-background/60 text-center italic">
            Piezas únicas, hechas con amor
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/30">
            Panel de Administración
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-6 sm:p-10 relative">
        {/* Mobile logo (visible on < lg) */}
        <div className="lg:hidden flex flex-col items-center gap-4 mb-10">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vIc7d77Mxciq8SIMP9l1xgruIEHbYn.png"
            alt="AMANDA"
            width={200}
            height={66}
            className="h-14 w-auto"
          />
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Panel de Administración
          </p>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-sans text-3xl text-foreground mb-2">
              Bienvenid@
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3.5 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
                placeholder="Tu usuario"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3.5 pr-12 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 px-4 py-3">
                <span className="font-mono text-xs text-destructive">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn size={14} />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">ó</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Back to store */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 border border-border py-3.5 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Ir a la tienda
          </Link>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40">
          © {new Date().getFullYear()} Amanda · Joyería artesanal
        </p>
      </div>
    </div>
  )
}
