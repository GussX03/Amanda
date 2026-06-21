import type { ApiResponse } from "./types"

const PRODUCTS_CACHE_KEY = "amanda_products_cache_v1"
const HERO_CACHE_KEY = "amanda_hero_cache_v1"
const PRODUCTS_CACHE_TTL_MS = 5 * 60 * 1000
const HERO_CACHE_TTL_MS = 5 * 60 * 1000

type CachedPayload<T> = {
  timestamp: number
  data: T
}

function readClientCache<T>(key: string, ttlMs: number): T | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as CachedPayload<T>
    if (!parsed?.timestamp || !parsed?.data) return null
    if (Date.now() - parsed.timestamp > ttlMs) return null

    return parsed.data
  } catch {
    return null
  }
}

function writeClientCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return

  try {
    const payload: CachedPayload<T> = {
      timestamp: Date.now(),
      data,
    }
    window.localStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // Ignore cache write failures.
  }
}

function clearClientCache(key: string) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore cache clear failures.
  }
}

export async function apiRequest(body: Record<string, any>): Promise<ApiResponse> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  return res.json()
}

export async function listProducts(): Promise<ApiResponse> {
  const res = await fetch("/api/products?action=listar_productos", {
    method: "GET",
    cache: "no-store",
  })
  return res.json()
}

export async function listHeroGallery(onlyActive = false): Promise<ApiResponse> {
  const params = new URLSearchParams({ action: "listar_fotos_home" })
  if (onlyActive) params.set("solo_activas", "true")

  const res = await fetch(`/api/products?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  })
  return res.json()
}

export function getProductsCache(): ApiResponse | null {
  return readClientCache<ApiResponse>(PRODUCTS_CACHE_KEY, PRODUCTS_CACHE_TTL_MS)
}

export function setProductsCache(data: ApiResponse) {
  writeClientCache(PRODUCTS_CACHE_KEY, data)
}

export function clearProductsCache() {
  clearClientCache(PRODUCTS_CACHE_KEY)
}

export function getHeroGalleryCache(): ApiResponse | null {
  return readClientCache<ApiResponse>(HERO_CACHE_KEY, HERO_CACHE_TTL_MS)
}

export function setHeroGalleryCache(data: ApiResponse) {
  writeClientCache(HERO_CACHE_KEY, data)
}

export function clearHeroGalleryCache() {
  clearClientCache(HERO_CACHE_KEY)
}

export async function getProduct(id: string): Promise<ApiResponse> {
  return apiRequest({ action: "obtener_producto", id_producto: id })
}

export async function deleteProduct(id: string): Promise<ApiResponse> {
  return apiRequest({ action: "eliminar_producto", id_producto: id })
}

export async function deletePhoto(idProducto: string, idFoto: string): Promise<ApiResponse> {
  return apiRequest({
    action: "eliminar_foto_producto",
    id_producto: idProducto,
    id_foto: idFoto,
  })
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Optimizes an image file before upload:
 * - Reduces resolution proportionally (max 1920px on longest side)
 * - Compresses via canvas with iterative quality reduction
 * - Returns base64 data URL ≤ 1 MB (target ~500 KB)
 * - Preserves visual quality as much as possible
 */
export function optimizeImage(
  file: File,
  { maxDimension = 1920, targetBytes = 500_000, ceilBytes = 1_000_000 } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      try {
        // 1. Compute scaled dimensions keeping aspect ratio
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, width, height)

        // 2. For PNGs without transparency, JPEG gives better compression
        const useJpeg = true // always compress as JPEG for photos
        const mimeType = useJpeg ? "image/jpeg" : "image/webp"

        // 3. Iterative quality reduction until under ceiling
        let quality = 0.92
        let dataUrl = canvas.toDataURL(mimeType, quality)

        // Estimate byte size from base64 (subtract header)
        const byteSize = (b64: string) => {
          const base64Str = b64.split(",")[1] || ""
          return Math.ceil(base64Str.length * 3 / 4)
        }

        // Try progressively lower quality if still too large
        while (byteSize(dataUrl) > ceilBytes && quality > 0.1) {
          quality -= 0.08
          dataUrl = canvas.toDataURL(mimeType, quality)
        }

        // If still over ceiling, scale down further
        if (byteSize(dataUrl) > ceilBytes) {
          const scale = Math.sqrt(targetBytes / byteSize(dataUrl))
          canvas.width = Math.round(width * scale)
          canvas.height = Math.round(height * scale)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          dataUrl = canvas.toDataURL(mimeType, quality)
        }

        resolve(dataUrl)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error("Failed to load image for optimization"))
    img.src = URL.createObjectURL(file)
  })
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
