"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Plus, Trash2, Pencil, LogOut, Search, RefreshCw, X, Upload, ImageIcon, Save,
  SlidersHorizontal, AlertTriangle, Check, ExternalLink,
} from "lucide-react"
import { ThemeToggleInverted } from "@/components/theme-toggle"
import { listProducts, deleteProduct, deletePhoto, apiRequest, fileToBase64, generateId } from "@/lib/api"
import type { Product, PhotoUpload } from "@/lib/types"

interface AdminDashboardProps {
  onLogout: () => void
}

/* ── Branded loading overlay ──────────────────────────────────────────── */
function LoadingOverlay({ message = "Procesando..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[200] bg-foreground/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border border-border px-8 py-6 shadow-2xl flex flex-col items-center gap-4">
        <RefreshCw size={24} className="animate-spin text-foreground" />
        <div className="text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Amanda</p>
          <p className="font-sans text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Branded confirm dialog ───────────────────────────────────────────── */
function ConfirmDialog({
  title, message, onConfirm, onCancel, confirmLabel = "Confirmar", destructive = false,
}: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void
  confirmLabel?: string; destructive?: boolean
}) {
  return (
    <div className="fixed inset-0 z-[150] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-sm shadow-2xl">
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
          <div className={`w-12 h-12 flex items-center justify-center rounded-full ${destructive ? "bg-destructive/10" : "bg-secondary"}`}>
            <AlertTriangle size={20} className={destructive ? "text-destructive" : "text-foreground"} />
          </div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Amanda</p>
          <h3 className="font-sans text-lg">{title}</h3>
          <p className="font-mono text-xs text-muted-foreground">{message}</p>
        </div>
        <div className="flex border-t border-border">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 font-mono text-xs tracking-[0.2em] uppercase hover:bg-secondary transition-colors border-r border-border"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 font-mono text-xs tracking-[0.2em] uppercase transition-colors ${
              destructive ? "bg-destructive text-background hover:bg-destructive/80" : "bg-foreground text-background hover:bg-accent hover:text-foreground"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Smart select with "Otra" option ──────────────────────────────────── */
function SmartSelect({
  label, value, onChange, options, placeholder, required = false,
}: {
  label: string; value: string; onChange: (v: string) => void
  options: string[]; placeholder: string; required?: boolean
}) {
  // "custom" mode when the current value doesn't exist in the options list
  // (and the value isn't empty — empty means nothing selected yet)
  const [mode, setMode] = useState<"select" | "custom">(
    value !== "" && !options.includes(value) ? "custom" : "select"
  )

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    if (v === "__custom__") {
      setMode("custom")
      onChange("")
    } else {
      setMode("select")
      onChange(v)
    }
  }

  // Compute the value shown in the <select>:
  // - if current value is in the options list → show it
  // - if value is empty (nothing selected) → show "" so the disabled placeholder shows
  // - otherwise it's a custom value that isn't in the list → shouldn't happen in select mode
  const selectValue = value === "" ? "" : options.includes(value) ? value : ""

  return (
    <div>
      <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
        {label}
      </label>
      {mode === "select" ? (
        <div className="relative">
          <select
            value={selectValue}
            onChange={handleSelectChange}
            className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors appearance-none"
            required={required}
          >
            <option value="" disabled>{placeholder}</option>
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
            <option value="__custom__">+ Otra...</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
            placeholder={`Escribe ${label.replace(" *", "").toLowerCase()}...`}
            required={required}
            autoFocus
          />
          {options.length > 0 && (
            <button
              type="button"
              onClick={() => { setMode("select"); onChange(options[0] || "") }}
              className="border border-border px-3 py-3 font-mono text-[10px] uppercase hover:bg-secondary transition-colors flex-shrink-0 whitespace-nowrap"
            >
              ← Lista
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════════════════════════════════════ */
export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [globalLoading, setGlobalLoading] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  const [confirmState, setConfirmState] = useState<{
    title: string; message: string; onConfirm: () => void
  } | null>(null)

  // Filters
  const [filterType, setFilterType] = useState("Todos")
  const [filterCategory, setFilterCategory] = useState("Todas")
  const [showFilters, setShowFilters] = useState(false)

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listProducts()
      if (res.status === "success" && res.productos) {
        setProducts(res.productos)
      } else {
        showToast(res.message || "Error al cargar productos", "err")
      }
    } catch {
      showToast("Error de conexión", "err")
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Derive filter options
  const typeOptions = useMemo(() => {
    const set = new Set(products.map((p) => p.tipo_de_producto))
    return ["Todos", ...Array.from(set).sort()]
  }, [products])

  const categoryOptions = useMemo(() => {
    const base = filterType === "Todos" ? products : products.filter((p) => p.tipo_de_producto === filterType)
    const set = new Set(base.map((p) => p.categoria))
    return ["Todas", ...Array.from(set).sort()]
  }, [products, filterType])

  useEffect(() => { setFilterCategory("Todas") }, [filterType])

  // All unique types and categories for smart selects
  const allTypes = useMemo(() => [...new Set(products.map((p) => p.tipo_de_producto))].sort(), [products])
  const allCategories = useMemo(() => [...new Set(products.map((p) => p.categoria))].sort(), [products])

  const handleDelete = (id: string, nombre: string) => {
    setConfirmState({
      title: "Eliminar producto",
      message: `¿Segura que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setConfirmState(null)
        setGlobalLoading("Eliminando producto...")
        const res = await deleteProduct(id)
        setGlobalLoading(null)
        if (res.status === "success") {
          showToast("Producto eliminado")
          fetchProducts()
        } else {
          showToast(res.message || "Error al eliminar", "err")
        }
      },
    })
  }

  const handleEdit = (p: Product) => {
    setEditingProduct(p)
    setShowForm(true)
  }

  const handleNew = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
    showToast("Producto guardado correctamente")
  }

  const filtered = useMemo(() => {
    let result = [...products]
    const q = search.toLowerCase()
    if (q) {
      result = result.filter((p) =>
        p.nombre.toLowerCase().includes(q) || p.tipo_de_producto.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) || p.id_producto.toLowerCase().includes(q)
      )
    }
    if (filterType !== "Todos") result = result.filter((p) => p.tipo_de_producto === filterType)
    if (filterCategory !== "Todas") result = result.filter((p) => p.categoria === filterCategory)
    return result
  }, [products, search, filterType, filterCategory])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {globalLoading && <LoadingOverlay message={globalLoading} />}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
          confirmLabel="Eliminar"
          destructive
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-foreground text-background border-b border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vIc7d77Mxciq8SIMP9l1xgruIEHbYn.png"
              alt="AMANDA"
              width={160}
              height={53}
              className="h-9 sm:h-10 w-auto"
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/50 hidden sm:inline">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-background/60 hover:text-background transition-colors px-2 py-1"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Ver tienda</span>
            </Link>
            <ThemeToggleInverted />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-background/60 hover:text-background transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl">Productos</h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {products.length} producto{products.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-accent hover:text-foreground transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={14} />
              Nuevo producto
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-background border border-border pl-9 pr-4 py-2.5 font-mono text-xs focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 border px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
                  showFilters ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                <SlidersHorizontal size={13} />
                Filtros
              </button>
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="flex items-center gap-2 border border-border px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Recargar</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border border-border bg-card p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Tipo</label>
                <div className="flex gap-2 flex-wrap">
                  {typeOptions.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${
                        filterType === t ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {categoryOptions.length > 1 && (
                <div className="flex-1">
                  <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Categoría</label>
                  <div className="flex gap-2 flex-wrap">
                    {categoryOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilterCategory(c)}
                        className={`font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${
                          filterCategory === c ? "bg-accent text-foreground border-accent" : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product form modal */}
        {showForm && (
          <ProductForm
            product={editingProduct}
            allTypes={allTypes}
            allCategories={allCategories}
            onClose={() => { setShowForm(false); setEditingProduct(null) }}
            onSaved={handleSaved}
            showToast={showToast}
          />
        )}

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              {search || filterType !== "Todos" || filterCategory !== "Todas" ? "Sin resultados" : "No hay productos"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                      <th className="px-4 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Foto</th>
                      <th className="px-4 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Nombre</th>
                      <th className="px-4 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Tipo</th>
                      <th className="px-4 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Categoría</th>
                      <th className="px-4 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Precio</th>
                      <th className="px-4 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id_producto} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          {p.fotos?.length > 0 ? (
                            <div className="relative w-12 h-12 bg-secondary overflow-hidden">
                              <Image src={p.fotos[0].foto} alt={p.nombre} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-secondary flex items-center justify-center">
                              <ImageIcon size={16} className="text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-sans text-sm">{p.nombre}</p>
                          <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">{p.descripcion}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{p.tipo_de_producto}</td>
                        <td className="px-4 py-3 font-mono text-xs">{p.categoria}</td>
                        <td className="px-4 py-3 font-mono text-sm">
                          ${p.precio.toFixed(2)}
                          {p.descuento_por_promocion && (
                            <span className="ml-1 text-[10px] text-accent">-{p.porcentaje_de_promocion}%</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(p)} className="p-2 hover:bg-secondary transition-colors" title="Editar">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(p.id_producto, p.nombre)} className="p-2 hover:bg-destructive/10 text-destructive transition-colors" title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((p) => (
                <div key={p.id_producto} className="border border-border bg-card p-4 flex gap-4">
                  {p.fotos?.length > 0 ? (
                    <div className="relative w-16 h-16 bg-secondary overflow-hidden flex-shrink-0">
                      <Image src={p.fotos[0].foto} alt={p.nombre} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-secondary flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium truncate">{p.nombre}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {p.tipo_de_producto} · {p.categoria}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-mono text-sm">
                        ${p.precio.toFixed(2)}
                        {p.descuento_por_promocion && (
                          <span className="ml-1 text-[10px] text-accent">-{p.porcentaje_de_promocion}%</span>
                        )}
                      </p>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(p)} className="p-2 hover:bg-secondary transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id_producto, p.nombre)} className="p-2 hover:bg-destructive/10 text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        toast ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}>
        <div className={`flex items-center gap-3 px-6 py-4 shadow-2xl border min-w-[240px] ${
          toast?.type === "ok"
            ? "bg-foreground text-background border-background/10"
            : "bg-destructive text-background border-destructive"
        }`}>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-background/20 flex-shrink-0">
            {toast?.type === "ok" ? <Check size={12} /> : <X size={12} />}
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">Amanda</span>
            <span className="font-sans text-sm">{toast?.msg}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PRODUCT FORM (Create / Edit) — with smart selects
   ══════════════════════════════════════════════════════════════════════════ */
interface ProductFormProps {
  product: Product | null
  allTypes: string[]
  allCategories: string[]
  onClose: () => void
  onSaved: () => void
  showToast: (msg: string, type: "ok" | "err") => void
}

function ProductForm({ product, allTypes, allCategories, onClose, onSaved, showToast }: ProductFormProps) {
  const isEdit = !!product

  const [nombre, setNombre] = useState(product?.nombre ?? "")
  const [tipo, setTipo] = useState(product?.tipo_de_producto ?? "")
  const [categoria, setCategoria] = useState(product?.categoria ?? "")
  const [precio, setPrecio] = useState(product?.precio?.toString() ?? "")
  const [descuento, setDescuento] = useState(product?.descuento_por_promocion ?? false)
  const [porcentaje, setPorcentaje] = useState(product?.porcentaje_de_promocion?.toString() ?? "0")
  const [descripcion, setDescripcion] = useState(product?.descripcion ?? "")
  const [existingPhotos, setExistingPhotos] = useState(product?.fotos ?? [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const removeExistingPhoto = async (idFoto: string) => {
    if (!product) return
    setDeletingPhoto(true)
    try {
      const res = await deletePhoto(product.id_producto, idFoto)
      if (res.status === "success") {
        setExistingPhotos((prev) => prev.filter((f) => f.id_foto !== idFoto))
        showToast("Foto eliminada", "ok")
      } else {
        showToast(res.message || "Error al eliminar foto", "err")
      }
    } catch {
      showToast("Error de conexión al eliminar foto", "err")
    }
    setDeletingPhoto(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !tipo || !categoria || !precio) {
      showToast("Completa todos los campos requeridos", "err")
      return
    }

    setSaving(true)

    try {
      const photosUpload: PhotoUpload[] = await Promise.all(
        newFiles.map(async (file) => ({
          id_foto: generateId("FOTO"),
          fileName: file.name,
          base64Data: await fileToBase64(file),
        }))
      )

      if (isEdit) {
        const updateRes = await apiRequest({
          action: "actualizar_producto",
          id_producto: product!.id_producto,
          nombre,
          tipo_de_producto: tipo,
          categoria,
          precio: parseFloat(precio),
          descuento_por_promocion: descuento,
          porcentaje_de_promocion: descuento ? parseInt(porcentaje) : 0,
          descripcion,
        })

        if (updateRes.status !== "success") {
          showToast(updateRes.message || "Error al actualizar", "err")
          setSaving(false)
          return
        }

        if (photosUpload.length > 0) {
          const photoRes = await apiRequest({
            action: "agregar_fotos_producto",
            id_producto: product!.id_producto,
            fotos: photosUpload,
          })
          if (photoRes.status !== "success") {
            showToast(photoRes.message || "Error al subir fotos", "err")
          }
        }
      } else {
        const idProducto = generateId("PROD")
        const createRes = await apiRequest({
          action: "agregar_producto",
          id_producto: idProducto,
          nombre,
          tipo_de_producto: tipo,
          categoria,
          precio: parseFloat(precio),
          descuento_por_promocion: descuento,
          porcentaje_de_promocion: descuento ? parseInt(porcentaje) : 0,
          descripcion,
          fotos: photosUpload,
        })

        if (createRes.status !== "success") {
          showToast(createRes.message || "Error al crear producto", "err")
          setSaving(false)
          return
        }
      }

      onSaved()
    } catch {
      showToast("Error de conexión", "err")
    }

    setSaving(false)
  }

  return (
    <>
      {saving && <LoadingOverlay message={isEdit ? "Actualizando producto..." : "Creando producto..."} />}
      {deletingPhoto && <LoadingOverlay message="Eliminando foto..." />}
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4 sm:py-10 px-4">
        <div className="bg-card border border-border w-full max-w-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
          <h2 className="font-sans text-lg sm:text-xl">
            {isEdit ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Nombre *
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
              required
            />
          </div>

          {/* Type + Category with smart selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SmartSelect
              label="Tipo de producto *"
              value={tipo}
              onChange={setTipo}
              options={allTypes}
              placeholder="Ej: Collares, Pulseras..."
              required
            />
            <SmartSelect
              label="Categoría *"
              value={categoria}
              onChange={setCategoria}
              options={allCategories}
              placeholder="Ej: Mujer, Unisex..."
              required
            />
          </div>

          {/* Price + discount */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Precio (MXN) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
                required
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer py-3">
                <input
                  type="checkbox"
                  checked={descuento}
                  onChange={(e) => setDescuento(e.target.checked)}
                  className="w-4 h-4 accent-foreground"
                />
                <span className="font-mono text-xs">Descuento</span>
              </label>
            </div>
            {descuento && (
              <div className="col-span-2 sm:col-span-1">
                <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                  % Descuento
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors resize-y"
            />
          </div>

          {/* Existing photos */}
          {isEdit && existingPhotos.length > 0 && (
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Fotos actuales ({existingPhotos.length})
              </label>
              <div className="flex gap-3 flex-wrap">
                {existingPhotos.map((foto) => (
                  <div key={foto.id_foto} className="relative group">
                    <div className="relative w-24 h-24 bg-secondary overflow-hidden border border-border">
                      <Image src={foto.foto} alt="" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(foto.id_foto)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-background flex items-center justify-center shadow-lg hover:bg-destructive/80 transition-colors z-10"
                      title="Eliminar foto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New photos */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
              {isEdit ? "Agregar fotos" : "Fotos"}
            </label>
            <label className="flex items-center gap-2 border border-dashed border-border px-4 py-6 cursor-pointer hover:bg-secondary/50 transition-colors justify-center">
              <Upload size={16} className="text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">Seleccionar imágenes</span>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
            {newFiles.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-3">
                {newFiles.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <div className="relative w-24 h-24 bg-secondary overflow-hidden border border-border">
                      <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-background flex items-center justify-center shadow-lg hover:bg-destructive/80 transition-colors z-10"
                      title="Quitar foto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}
