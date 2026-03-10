"use client"

import Image from "next/image"
import { Plus, Check, Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useCart } from "./cart-context"
import { useCopyToast } from "./copy-toast"
import { listProducts } from "@/lib/api"
import type { Product } from "@/lib/types"

/* ─── Lightbox / Image Modal ─────────────────────────────────────────── */
function ProductLightbox({
	product,
	onClose,
}: {
	product: Product
	onClose: () => void
}) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const photos = product.fotos ?? []
	const hasMultiple = photos.length > 1

	const goNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % photos.length)
	}, [photos.length])

	const goPrev = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
	}, [photos.length])

	// Keyboard navigation
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
			if (e.key === "ArrowRight" && hasMultiple) goNext()
			if (e.key === "ArrowLeft" && hasMultiple) goPrev()
		}
		document.addEventListener("keydown", handleKey)
		document.body.style.overflow = "hidden"
		return () => {
			document.removeEventListener("keydown", handleKey)
			document.body.style.overflow = ""
		}
	}, [onClose, hasMultiple, goNext, goPrev])

	// Touch swipe support
	const [touchStart, setTouchStart] = useState<number | null>(null)
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.touches[0].clientX)
	}
	const handleTouchEnd = (e: React.TouchEvent) => {
		if (touchStart === null || !hasMultiple) return
		const diff = e.changedTouches[0].clientX - touchStart
		if (Math.abs(diff) > 60) {
			if (diff < 0) goNext()
			else goPrev()
		}
		setTouchStart(null)
	}

	const finalPrice = product.descuento_por_promocion
		? product.precio * (1 - product.porcentaje_de_promocion / 100)
		: product.precio

	if (photos.length === 0) return null

	return (
		<div
			className="fixed inset-0 z-[100] bg-foreground/80 backdrop-blur-md flex items-center justify-center p-4"
			onClick={onClose}
		>
			<div
				className="bg-card border border-border w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
					<div className="min-w-0">
						<p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
							Amanda
						</p>
						<h3 className="font-sans text-lg truncate">{product.nombre}</h3>
					</div>
					<button
						onClick={onClose}
						className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0 ml-4"
						aria-label="Cerrar"
					>
						<X size={20} />
					</button>
				</div>

				{/* Image area */}
				<div
					className="relative flex-1 min-h-0 bg-secondary flex items-center justify-center"
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
				>
					<div className="relative w-full h-full min-h-[300px] max-h-[60vh]">
						<Image
							src={photos[currentIndex].foto}
							alt={`${product.nombre} - Foto ${currentIndex + 1}`}
							fill
							className="object-contain"
							sizes="(max-width: 768px) 100vw, 700px"
							priority
						/>
					</div>

					{/* Nav arrows */}
					{hasMultiple && (
						<>
							<button
								onClick={goPrev}
								className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm border border-border w-10 h-10 flex items-center justify-center hover:bg-background transition-colors"
								aria-label="Foto anterior"
							>
								<ChevronLeft size={18} />
							</button>
							<button
								onClick={goNext}
								className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm border border-border w-10 h-10 flex items-center justify-center hover:bg-background transition-colors"
								aria-label="Foto siguiente"
							>
								<ChevronRight size={18} />
							</button>
						</>
					)}

					{/* Counter */}
					{hasMultiple && (
						<div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border px-3 py-1.5">
							<span className="font-mono text-[10px] tracking-[0.2em] uppercase">
								{currentIndex + 1} / {photos.length}
							</span>
						</div>
					)}
				</div>

				{/* Thumbnail strip */}
				{hasMultiple && (
					<div className="flex gap-1 px-5 py-3 border-t border-border overflow-x-auto flex-shrink-0">
						{photos.map((photo, idx) => (
							<button
								key={photo.id_foto}
								onClick={() => setCurrentIndex(idx)}
								className={`relative w-14 h-14 flex-shrink-0 overflow-hidden transition-all ${
									idx === currentIndex
										? "ring-2 ring-foreground ring-offset-1 ring-offset-background"
										: "opacity-50 hover:opacity-80"
								}`}
							>
								<Image
									src={photo.foto}
									alt={`Miniatura ${idx + 1}`}
									fill
									className="object-cover"
									sizes="56px"
								/>
							</button>
						))}
					</div>
				)}

				{/* Product info footer */}
				<div className="flex items-center justify-between px-5 py-4 border-t border-border flex-shrink-0">
					<div>
						<p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
							{product.tipo_de_producto} · {product.categoria}
						</p>
						<div className="flex items-baseline gap-2 mt-1">
							<p className="font-sans text-xl">
								${finalPrice.toFixed(2)}{" "}
								<span className="font-mono text-xs text-muted-foreground">MXN</span>
							</p>
							{product.descuento_por_promocion && (
								<p className="font-mono text-xs text-muted-foreground line-through">
									${product.precio.toFixed(2)}
								</p>
							)}
						</div>
					</div>
					{product.descripcion && (
						<p className="font-mono text-xs text-muted-foreground max-w-[200px] text-right line-clamp-2 hidden sm:block">
							{product.descripcion}
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

/* ─── Product Card ────────────────────────────────────────────────────── */
function ProductCard({
	product,
	onOpenLightbox,
}: {
	product: Product
	onOpenLightbox: (product: Product) => void
}) {
	const { addItem } = useCart()
	const [added, setAdded] = useState(false)

	const finalPrice = product.descuento_por_promocion
		? product.precio * (1 - product.porcentaje_de_promocion / 100)
		: product.precio

	const mainImage = product.fotos?.[0]?.foto || "/placeholder.svg"
	const photoCount = product.fotos?.length ?? 0

	const handleAdd = () => {
		addItem({
			id: parseInt(product.id_producto.replace(/\D/g, "")) || Date.now(),
			name: product.nombre,
			price: finalPrice,
			image: mainImage,
		})
		setAdded(true)
		setTimeout(() => setAdded(false), 1500)
	}

	return (
		<article className="group flex flex-col bg-card">
			{/* Image — clickable to open lightbox */}
			<div
				className="relative aspect-square overflow-hidden bg-secondary cursor-pointer"
				onClick={() => onOpenLightbox(product)}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => { if (e.key === "Enter") onOpenLightbox(product) }}
				aria-label={`Ver fotos de ${product.nombre}`}
			>
				<Image
					src={mainImage}
					alt={product.nombre}
					fill
					className="object-cover group-hover:scale-105 transition-transform duration-700"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
				/>
				<div className="absolute top-3 left-3 flex gap-1.5">
					<span className="bg-background/90 backdrop-blur-sm font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-1">
						{product.tipo_de_producto}
					</span>
					{product.descuento_por_promocion && (
						<span className="bg-accent/90 backdrop-blur-sm text-foreground font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-1">
							-{product.porcentaje_de_promocion}%
						</span>
					)}
				</div>
				{/* Photo count + zoom indicator */}
				{photoCount > 0 && (
					<div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<ZoomIn size={12} className="text-muted-foreground" />
						<span className="font-mono text-[10px] tracking-wider text-muted-foreground">
							{photoCount} foto{photoCount !== 1 ? "s" : ""}
						</span>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex flex-col flex-1 p-4 gap-3">
				<div className="flex-1">
					<p className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
						{product.categoria}
					</p>
					<h3 className="font-sans text-lg leading-snug text-balance">
						{product.nombre}
					</h3>
					<p className="font-mono text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
						{product.descripcion}
					</p>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-baseline gap-2">
						<p className="font-sans text-xl">
							${finalPrice.toFixed(2)}{" "}
							<span className="font-mono text-xs text-muted-foreground">
								MXN
							</span>
						</p>
						{product.descuento_por_promocion && (
							<p className="font-mono text-xs text-muted-foreground line-through">
								${product.precio.toFixed(2)}
							</p>
						)}
					</div>
					<button
						onClick={handleAdd}
						className={`flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
							added
								? "bg-accent text-foreground"
								: "bg-foreground text-background hover:bg-accent hover:text-foreground"
						}`}
						aria-label={`Agregar ${product.nombre} al carrito`}
					>
						{added ? (
							<>
								<Check size={12} />
								Agregado
							</>
						) : (
							<>
								<Plus size={12} />
								Agregar
							</>
						)}
					</button>
				</div>
			</div>
		</article>
	)
}

/* ─── Main Grid ───────────────────────────────────────────────────────── */
export function ProductGrid() {
	const { copyToClipboard } = useCopyToast()
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	// Lightbox
	const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null)

	// Filters
	const [searchQuery, setSearchQuery] = useState("")
	const [activeType, setActiveType] = useState("Todos")
	const [activeCategory, setActiveCategory] = useState("Todas")
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
	const [showOnlySale, setShowOnlySale] = useState(false)
	const [showFilters, setShowFilters] = useState(false)
	const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name">("default")

	// Fetch products
	useEffect(() => {
		async function load() {
			setLoading(true)
			try {
				const res = await listProducts()
				if (res.status === "success" && res.productos) {
					setProducts(res.productos)
					if (res.productos.length > 0) {
						const prices = res.productos.map((p) => p.precio)
						setPriceRange([0, Math.ceil(Math.max(...prices) * 1.1)])
					}
				} else {
					setError(res.message || "Error al cargar productos")
				}
			} catch {
				setError("Error de conexión. Intenta de nuevo.")
			}
			setLoading(false)
		}
		load()
	}, [])

	// Derive unique types and categories
	const types = useMemo(() => {
		const set = new Set(products.map((p) => p.tipo_de_producto))
		return ["Todos", ...Array.from(set).sort()]
	}, [products])

	const categories = useMemo(() => {
		const filtered = activeType === "Todos" ? products : products.filter((p) => p.tipo_de_producto === activeType)
		const set = new Set(filtered.map((p) => p.categoria))
		return ["Todas", ...Array.from(set).sort()]
	}, [products, activeType])

	const maxPrice = useMemo(() => {
		if (products.length === 0) return 10000
		return Math.ceil(Math.max(...products.map((p) => p.precio)) * 1.1)
	}, [products])

	// Reset category when type changes
	useEffect(() => {
		setActiveCategory("Todas")
	}, [activeType])

	// Filtered & sorted
	const filtered = useMemo(() => {
		let result = [...products]

		if (activeType !== "Todos") {
			result = result.filter((p) => p.tipo_de_producto === activeType)
		}
		if (activeCategory !== "Todas") {
			result = result.filter((p) => p.categoria === activeCategory)
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase()
			result = result.filter(
				(p) =>
					p.nombre.toLowerCase().includes(q) ||
					p.descripcion.toLowerCase().includes(q) ||
					p.categoria.toLowerCase().includes(q) ||
					p.tipo_de_producto.toLowerCase().includes(q)
			)
		}
		result = result.filter((p) => p.precio >= priceRange[0] && p.precio <= priceRange[1])
		if (showOnlySale) {
			result = result.filter((p) => p.descuento_por_promocion)
		}

		switch (sortBy) {
			case "price-asc":
				result.sort((a, b) => a.precio - b.precio)
				break
			case "price-desc":
				result.sort((a, b) => b.precio - a.precio)
				break
			case "name":
				result.sort((a, b) => a.nombre.localeCompare(b.nombre))
				break
		}

		return result
	}, [products, activeType, activeCategory, searchQuery, priceRange, showOnlySale, sortBy])

	const instagramProfile = "https://www.instagram.com/amanda._oficial_"
	const suggestedMessage = "Hola, quiero información sobre el servicio"

	return (
		<section id="products" className="py-20 px-6 max-w-6xl mx-auto">
			{/* Lightbox */}
			{lightboxProduct && (
				<ProductLightbox
					product={lightboxProduct}
					onClose={() => setLightboxProduct(null)}
				/>
			)}

			{/* Section header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
				<div>
					<p className="font-mono text-xs tracking-[0.3em] uppercase text-accent mb-2">
						Colección
					</p>
					<h2
						className="font-sans text-4xl md:text-5xl"
						style={{ letterSpacing: "-0.02em" }}
					>
						Nuestros productos
					</h2>
				</div>

				{/* Search + Filters toggle */}
				<div className="flex items-center gap-3">
					<div className="relative">
						<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Buscar..."
							className="bg-background border border-border pl-9 pr-4 py-2.5 font-mono text-xs w-48 focus:outline-none focus:border-foreground transition-colors"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								<X size={12} />
							</button>
						)}
					</div>
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`flex items-center gap-2 border px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
							showFilters
								? "bg-foreground text-background border-foreground"
								: "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
						}`}
					>
						<SlidersHorizontal size={13} />
						Filtros
					</button>
				</div>
			</div>

			{/* Type pills */}
			<div className="flex gap-2 flex-wrap mb-4">
				{types.map((t) => (
					<button
						key={t}
						onClick={() => setActiveType(t)}
						className={`font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${
							activeType === t
								? "bg-foreground text-background border-foreground"
								: "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
						}`}
					>
						{t}
					</button>
				))}
			</div>

			{/* Category pills */}
			{categories.length > 1 && (
				<div className="flex gap-2 flex-wrap mb-6">
					{categories.map((c) => (
						<button
							key={c}
							onClick={() => setActiveCategory(c)}
							className={`font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${
								activeCategory === c
									? "bg-accent text-foreground border-accent"
									: "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
							}`}
						>
							{c}
						</button>
					))}
				</div>
			)}

			{/* Advanced filters panel */}
			{showFilters && (
				<div className="border border-border bg-card p-5 mb-6 flex flex-col sm:flex-row gap-6 items-start sm:items-end">
					<div className="flex-1 min-w-[200px]">
						<label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
							Precio máximo: ${priceRange[1]} MXN
						</label>
						<input
							type="range"
							min={0}
							max={maxPrice}
							step={10}
							value={priceRange[1]}
							onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
							className="w-full accent-foreground"
						/>
					</div>

					<div className="min-w-[180px]">
						<label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
							Ordenar por
						</label>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
							className="w-full bg-background border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:border-foreground transition-colors appearance-none"
						>
							<option value="default">Predeterminado</option>
							<option value="price-asc">Precio: menor a mayor</option>
							<option value="price-desc">Precio: mayor a menor</option>
							<option value="name">Nombre A-Z</option>
						</select>
					</div>

					<label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
						<input
							type="checkbox"
							checked={showOnlySale}
							onChange={(e) => setShowOnlySale(e.target.checked)}
							className="w-4 h-4 accent-foreground"
						/>
						<span className="font-mono text-xs">Solo en oferta</span>
					</label>
				</div>
			)}

			{/* Results count */}
			<p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground mb-4">
				{loading ? "Cargando productos..." : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
			</p>

			{/* Grid */}
			{loading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="bg-card animate-pulse">
							<div className="aspect-square bg-secondary" />
							<div className="p-4 space-y-3">
								<div className="h-3 bg-secondary rounded w-1/3" />
								<div className="h-5 bg-secondary rounded w-2/3" />
								<div className="h-3 bg-secondary rounded w-full" />
							</div>
						</div>
					))}
				</div>
			) : error ? (
				<div className="text-center py-20 border border-border">
					<p className="font-mono text-xs text-destructive tracking-widest uppercase mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="border border-border px-6 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-secondary transition-colors"
					>
						Reintentar
					</button>
				</div>
			) : filtered.length === 0 ? (
				<div className="text-center py-20 border border-border">
					<p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
						No se encontraron productos
					</p>
				</div>
			) : (
				<div className={`grid gap-px bg-border border border-border ${
					filtered.length === 1
						? "grid-cols-1 max-w-sm"
						: filtered.length === 2
						? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
						: filtered.length === 3
						? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl"
						: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
				}`}>
					{filtered.map((product) => (
						<ProductCard
							key={product.id_producto}
							product={product}
							onOpenLightbox={setLightboxProduct}
						/>
					))}
				</div>
			)}

			{/* CTA below */}
			<div className="mt-12 text-center">
				<p className="font-mono text-sm text-muted-foreground mb-4">
					¿Buscas algo especial? Hacemos piezas personalizadas.
				</p>
				<div className="flex items-center justify-center gap-4">
					<button
						type="button"
						onClick={() => copyToClipboard(suggestedMessage)}
						className="inline-flex items-center gap-2 border border-foreground px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-secondary transition-colors"
					>
						Copiar mensaje
					</button>
					<a
						href={instagramProfile}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-accent hover:text-foreground transition-colors"
					>
						Abrir Instagram
					</a>
				</div>
			</div>
		</section>
	)
}
