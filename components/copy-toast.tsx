"use client"

import { useState, useCallback, createContext, useContext, type ReactNode } from "react"
import { Check, X } from "lucide-react"

type ToastState = { visible: boolean; message: string; success: boolean }

const CopyToastContext = createContext<{
  copyToClipboard: (text: string) => Promise<void>
}>({ copyToClipboard: async () => {} })

export const useCopyToast = () => useContext(CopyToastContext)

export function CopyToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", success: true })

  const showToast = useCallback((message: string, success: boolean) => {
    setToast({ visible: true, message, success })
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2400)
  }, [])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        showToast("Mensaje copiado ✨", true)
        return
      }

      // Fallback for insecure contexts (HTTP)
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      showToast("Mensaje copiado ✨", true)
    } catch {
      showToast("No se pudo copiar el mensaje", false)
    }
  }, [showToast])

  return (
    <CopyToastContext.Provider value={{ copyToClipboard }}>
      {children}

      {/* ─── Branded toast popup ─────────────────────────────────── */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out ${
          toast.visible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 bg-foreground text-background px-6 py-4 shadow-2xl border border-background/10 min-w-[260px]">
          {/* Icon */}
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
              toast.success ? "bg-background/20" : "bg-red-500/20"
            }`}
          >
            {toast.success ? (
              <Check size={16} className="text-background" />
            ) : (
              <X size={16} className="text-red-300" />
            )}
          </span>

          {/* Text */}
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/50">
              Amanda
            </span>
            <span className="font-sans text-sm">{toast.message}</span>
          </div>
        </div>
      </div>
    </CopyToastContext.Provider>
  )
}
