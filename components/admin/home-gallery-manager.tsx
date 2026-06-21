"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, ImageIcon, RefreshCw, Save, Trash2, Upload } from "lucide-react"
import { apiRequest, generateId, listHeroGallery, optimizeImage, setHeroGalleryCache } from "@/lib/api"
import type { HeroGalleryConfig, HeroGalleryPhoto, PhotoUpload } from "@/lib/types"

interface HomeGalleryManagerProps {
  showToast: (msg: string, type: "ok" | "err") => void
}

interface PendingHeroPhoto {
  id: string
  file: File
  previewUrl: string
  position_x: number
  position_y: number
}

const DEFAULT_CONFIG: HeroGalleryConfig = {
  aspect_ratio: "4:5",
}

const RATIO_OPTIONS = [
  "1:1",
  "4:5",
  "3:4",
  "4:3",
  "16:9",
]

function aspectRatioValue(ratio: string) {
  const [width, height] = ratio.split(":").map(Number)
  if (!width || !height) return "4 / 5"
  return `${width} / ${height}`
}

export function HomeGalleryManager({ showToast }: HomeGalleryManagerProps) {
  const [photos, setPhotos] = useState<HeroGalleryPhoto[]>([])
  const [newFiles, setNewFiles] = useState<PendingHeroPhoto[]>([])
  const [heroConfig, setHeroConfig] = useState<HeroGalleryConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const ratioStyle = useMemo(
    () => ({ aspectRatio: aspectRatioValue(heroConfig.aspect_ratio || DEFAULT_CONFIG.aspect_ratio) }),
    [heroConfig.aspect_ratio]
  )

  const fetchGallery = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listHeroGallery()
      if (res.status === "success") {
        const sortedPhotos = [...(res.hero_fotos ?? [])].sort(
          (a, b) => a.orden - b.orden || a.id_foto.localeCompare(b.id_foto)
        )

        setPhotos(sortedPhotos)
        setHeroConfig(res.hero_config ?? DEFAULT_CONFIG)
        setHeroGalleryCache({
          ...res,
          hero_fotos: sortedPhotos,
          hero_config: res.hero_config ?? DEFAULT_CONFIG,
        })
      } else {
        showToast(res.message || "Error al cargar la galería del home", "err")
      }
    } catch {
      showToast("Error de conexión al cargar la galería del home", "err")
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const updateLocalPhoto = (idFoto: string, patch: Partial<HeroGalleryPhoto>) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id_foto === idFoto ? { ...photo, ...patch } : photo))
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const nextFiles = Array.from(e.target.files).map((file) => ({
      id: generateId("PENDING-HERO"),
      file,
      previewUrl: URL.createObjectURL(file),
      position_x: 50,
      position_y: 50,
    }))

    setNewFiles((prev) => [...prev, ...nextFiles])
    e.target.value = ""
  }

  const removeNewFile = (id: string) => {
    setNewFiles((prev) => {
      const fileToRemove = prev.find((item) => item.id === id)
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
  }

  const updatePendingFile = (id: string, patch: Partial<PendingHeroPhoto>) => {
    setNewFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  const handleUpload = async () => {
    if (newFiles.length === 0) {
      showToast("Selecciona al menos una foto", "err")
      return
    }

    setUploading(true)
    try {
      const photosUpload: PhotoUpload[] = await Promise.all(
        newFiles.map(async (item) => ({
          id_foto: generateId("HERO"),
          fileName: item.file.name,
          base64Data: await optimizeImage(item.file),
          position_x: item.position_x,
          position_y: item.position_y,
        }))
      )

      const res = await apiRequest({
        action: "agregar_fotos_home",
        fotos: photosUpload,
      })

      if (res.status !== "success") {
        showToast(res.message || "Error al subir las fotos del home", "err")
        setUploading(false)
        return
      }

      newFiles.forEach((file) => URL.revokeObjectURL(file.previewUrl))
      setNewFiles([])
      await fetchGallery()
      showToast("Fotos del home guardadas", "ok")
    } catch {
      showToast("Error de conexión al subir las fotos del home", "err")
    }
    setUploading(false)
  }

  const handleSaveConfig = async () => {
    setSavingConfig(true)
    try {
      const res = await apiRequest({
        action: "actualizar_config_home",
        aspect_ratio: heroConfig.aspect_ratio,
      })

      if (res.status === "success") {
        await fetchGallery()
        showToast("Relación actualizada", "ok")
      } else {
        showToast(res.message || "Error al actualizar la relación", "err")
      }
    } catch {
      showToast("Error de conexión al actualizar la relación", "err")
    }
    setSavingConfig(false)
  }

  const handleSavePhoto = async (photo: HeroGalleryPhoto) => {
    setSavingId(photo.id_foto)
    try {
      const res = await apiRequest({
        action: "actualizar_foto_home",
        id_foto: photo.id_foto,
        orden: Number(photo.orden) || 0,
        activo: photo.activo,
        position_x: Number(photo.position_x) || 50,
        position_y: Number(photo.position_y) || 50,
      })

      if (res.status === "success") {
        await fetchGallery()
        showToast("Foto actualizada", "ok")
      } else {
        showToast(res.message || "Error al actualizar la foto", "err")
      }
    } catch {
      showToast("Error de conexión al actualizar la foto", "err")
    }
    setSavingId(null)
  }

  const handleDeletePhoto = async (photo: HeroGalleryPhoto) => {
    if (!window.confirm(`¿Eliminar esta foto del home?\n\nID: ${photo.id_foto}`)) return

    setDeletingId(photo.id_foto)
    try {
      const res = await apiRequest({
        action: "eliminar_foto_home",
        id_foto: photo.id_foto,
      })

      if (res.status === "success") {
        await fetchGallery()
        showToast("Foto eliminada", "ok")
      } else {
        showToast(res.message || "Error al eliminar la foto", "err")
      }
    } catch {
      showToast("Error de conexión al eliminar la foto", "err")
    }
    setDeletingId(null)
  }

  return (
    <section className="mt-8 border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Home
            </p>
            <h2 className="mt-1 font-sans text-xl sm:text-2xl">Fotos del hero</h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Controla las imágenes debajo de “Contáctame”, su relación y el encuadre real.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 border border-border px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors hover:bg-secondary">
              <Upload size={13} />
              Seleccionar fotos
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
            <button
              onClick={handleUpload}
              disabled={uploading || newFiles.length === 0}
              className="inline-flex items-center justify-center gap-2 bg-foreground px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase text-background transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              {uploading ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              Guardar fotos
            </button>
            <button
              onClick={fetchGallery}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 border border-border px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Recargar
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-t border-border pt-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-end">
            <div>
              <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Relación global
              </label>
              <select
                value={heroConfig.aspect_ratio}
                onChange={(e) => setHeroConfig((prev) => ({ ...prev, aspect_ratio: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-3 font-mono text-sm focus:border-foreground focus:outline-none"
              >
                {RATIO_OPTIONS.map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {ratio}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-border px-4 py-3 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors hover:bg-secondary disabled:opacity-50 sm:w-fit"
            >
              {savingConfig ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              Guardar relación
            </button>
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Preview global
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {(photos.slice(0, 2).length > 0 ? photos.slice(0, 2) : [{ id_foto: "preview", foto: "", orden: 1, activo: true, position_x: 50, position_y: 50 }]).map((photo) => (
                <div
                  key={photo.id_foto}
                  className="w-[9.5rem] flex-shrink-0 overflow-hidden bg-secondary sm:min-w-0 sm:flex-1 sm:w-auto"
                  style={ratioStyle}
                >
                  {photo.foto ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={photo.foto}
                        alt=""
                        fill
                        className="object-cover"
                        style={{ objectPosition: `${photo.position_x}% ${photo.position_y}%` }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {newFiles.length > 0 && (
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <p className="mb-3 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            Nuevas fotos ({newFiles.length})
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {newFiles.map((item) => (
              <article key={item.id} className="border border-border bg-background p-3 sm:p-4">
                <div className="grid grid-cols-[116px_minmax(0,1fr)] items-start gap-3 sm:block">
                  <div
                    className="relative w-[116px] overflow-hidden bg-secondary sm:mx-auto sm:w-full sm:max-w-[260px]"
                    style={ratioStyle}
                  >
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      fill
                      className="object-cover"
                      style={{ objectPosition: `${item.position_x}% ${item.position_y}%` }}
                    />
                  </div>

                  <div className="min-w-0 space-y-3 sm:pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground sm:text-[10px] sm:tracking-[0.16em]">
                      {item.file.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeNewFile(item.id)}
                      className="inline-flex h-8 w-8 items-center justify-center border border-destructive text-destructive transition-colors hover:bg-destructive/10"
                      aria-label={`Quitar ${item.file.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                    <div className="space-y-3">
                    <div>
                      <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                        Encuadre horizontal
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={item.position_x}
                        onChange={(e) => updatePendingFile(item.id, { position_x: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                        Encuadre vertical
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={item.position_y}
                        onChange={(e) => updatePendingFile(item.id, { position_y: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-4 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={18} className="animate-spin text-muted-foreground" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
            <ImageIcon size={24} className="text-muted-foreground" />
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
              No hay fotos configuradas para el hero
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => (
              <article key={photo.id_foto} className="border border-border bg-background p-3 sm:p-4">
                <div className="grid grid-cols-[116px_minmax(0,1fr)] items-start gap-3 sm:block">
                  <div
                    className="relative w-[116px] overflow-hidden bg-secondary sm:mx-auto sm:w-full sm:max-w-[260px]"
                    style={ratioStyle}
                  >
                    <Image
                      src={photo.foto}
                      alt=""
                      fill
                      className="object-cover"
                      style={{ objectPosition: `${photo.position_x}% ${photo.position_y}%` }}
                    />
                    <div className="absolute left-2 top-2 bg-background/92 px-1.5 py-1 font-mono text-[8px] tracking-[0.16em] uppercase text-foreground sm:left-3 sm:top-3 sm:px-2 sm:text-[9px] sm:tracking-[0.18em]">
                      Orden {photo.orden}
                    </div>
                  </div>

                  <div className="min-w-0 space-y-3 sm:pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground sm:text-[10px] sm:tracking-[0.16em]">
                      {photo.id_foto}
                    </p>
                    <span className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase ${
                      photo.activo ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {photo.activo ? <Eye size={13} /> : <EyeOff size={13} />}
                      {photo.activo ? "Visible" : "Oculta"}
                    </span>
                  </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                        Orden
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={photo.orden}
                        onChange={(e) => updateLocalPhoto(photo.id_foto, { orden: Number(e.target.value) || 0 })}
                        className="w-full border border-border bg-background px-3 py-2.5 font-mono text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex min-h-[42px] w-full cursor-pointer items-center justify-between border border-border px-3 py-2.5">
                        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                          Mostrar
                        </span>
                        <input
                          type="checkbox"
                          checked={photo.activo}
                          onChange={(e) => updateLocalPhoto(photo.id_foto, { activo: e.target.checked })}
                          className="h-4 w-4 accent-foreground"
                        />
                      </label>
                    </div>
                  </div>

                    <div className="space-y-3">
                    <div>
                      <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                        Encuadre horizontal
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={photo.position_x}
                        onChange={(e) => updateLocalPhoto(photo.id_foto, { position_x: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                        Encuadre vertical
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={photo.position_y}
                        onChange={(e) => updateLocalPhoto(photo.id_foto, { position_y: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleSavePhoto(photo)}
                      disabled={savingId === photo.id_foto}
                      className="inline-flex flex-1 items-center justify-center gap-2 bg-foreground px-4 py-3 font-mono text-[10px] tracking-[0.16em] uppercase text-background transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                      {savingId === photo.id_foto ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      disabled={deletingId === photo.id_foto}
                      className="inline-flex items-center justify-center gap-2 border border-destructive px-4 py-3 font-mono text-[10px] tracking-[0.16em] uppercase text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {deletingId === photo.id_foto ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      Eliminar
                    </button>
                  </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
