export interface ProductPhoto {
  id_foto: string
  foto: string
  id_producto: string
}

export interface Product {
  id_producto: string
  nombre: string
  tipo_de_producto: string
  categoria: string
  precio: number
  descuento_por_promocion: boolean
  porcentaje_de_promocion: number
  descripcion: string
  fotos_ids: string[]
  fotos: ProductPhoto[]
}

export interface PhotoUpload {
  id_foto: string
  fileName: string
  base64Data: string
}

export interface ApiResponse {
  status: "success" | "error"
  message?: string
  id_producto?: string
  fotos_ids?: string[]
  producto?: Product
  productos?: Product[]
  total?: number
  fotos?: ProductPhoto[]
  fotos_ids_agregadas?: string[]
  id_foto?: string
}
