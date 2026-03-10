"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const session = sessionStorage.getItem("amanda_admin")
    if (session === "ok") setAuthenticated(true)
    setChecking(false)
  }, [])

  const handleLogin = (user: string, password: string): boolean => {
    if (user === "amanda" && password === "pulseras03") {
      sessionStorage.setItem("amanda_admin", "ok")
      setAuthenticated(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    sessionStorage.removeItem("amanda_admin")
    setAuthenticated(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
          Cargando...
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}
