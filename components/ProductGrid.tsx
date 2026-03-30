"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { dataProvider } from "@/lib/repositories"
import type { Product } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductGridProps {
  title?: string
  subtitle?: string
  showFilters?: boolean
  categoryId?: string
  limit?: number
}

export function ProductGrid({
  title = "Nuestros Productos",
  subtitle,
  showFilters = true,
  categoryId,
  limit,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || "all")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name")

      if (data) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)

      try {
        let data = await dataProvider.products.getAllForListing()
        
        // Filter by category
        if (selectedCategory && selectedCategory !== "all") {
          data = data.filter(p => p.category_id === selectedCategory)
        }

        // Sort
        switch (sortBy) {
          case "price_asc":
            data = [...data].sort((a, b) => a.price - b.price)
            break
          case "price_desc":
            data = [...data].sort((a, b) => b.price - a.price)
            break
          case "name":
            data = [...data].sort((a, b) => a.name.localeCompare(b.name))
            break
          case "newest":
          default:
            // Already sorted by newest from dataProvider
            break
        }

        // Limit
        if (limit) {
          data = data.slice(0, limit)
        }

        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
      }

      setLoading(false)
    }

    fetchProducts()
  }, [selectedCategory, sortBy, limit])

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mas recientes</SelectItem>
                <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron productos.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
