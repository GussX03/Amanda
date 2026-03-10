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

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
