import type { ApiResponse } from "./types"

export async function apiRequest(body: Record<string, any>): Promise<ApiResponse> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function listProducts(): Promise<ApiResponse> {
  return apiRequest({ action: "listar_productos" })
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
