"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, LogIn } from "lucide-react"

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
    <div className="min-h-screen bg-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vIc7d77Mxciq8SIMP9l1xgruIEHbYn.png"
            alt="AMANDA"
            width={140}
            height={46}
            className="h-10 w-auto opacity-80"
          />
        </div>

        <div className="bg-card border border-border p-8">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground text-center mb-8">
            Panel de Administración
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
                placeholder="usuario"
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
                  className="w-full bg-background border border-border px-4 py-3 pr-12 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
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
              <p className="font-mono text-xs text-destructive text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Verificando...</span>
              ) : (
                <>
                  <LogIn size={14} />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 font-mono text-[10px] tracking-[0.2em] uppercase text-background/30">
          © {new Date().getFullYear()} Amanda
        </p>
      </div>
    </div>
  )
}
