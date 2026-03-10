import { CartProvider } from "@/components/cart-context"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"

export default function Home() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Hero />
          <ProductGrid />
        </main>
        <Footer />
        {/* CartDrawer rendered at root — outside any fixed/transformed ancestor */}
        <CartDrawer />
      </div>
    </CartProvider>
  )
}
