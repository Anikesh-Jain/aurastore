"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RotateCcw, Search, SlidersHorizontal, PackageX } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductType {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  isFeatured: boolean;
  ratingAvg: number;
  ratingCount: number;
  category: { name: string; slug: string };
  images: { url: string; isPrimary: boolean }[];
}

interface CategoryType {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface ProductCatalogClientProps {
  initialProducts: ProductType[];
  categories: CategoryType[];
}

export function ProductCatalogClient({ initialProducts, categories }: ProductCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);

  // Sync state whenever URL query params change (e.g. from navbar clicks or search)
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const q = searchParams.get("search") || "";
    const s = searchParams.get("sort") || "newest";
    setSelectedCategory(cat);
    setSearchQuery(q);
    setSortOption(s);
  }, [searchParams]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== "all" && product.category?.slug !== selectedCategory) {
        return false;
      }

      // Search query
      if (
        searchQuery.trim() &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Price filter
      const activePrice = product.discountPrice ?? product.price;
      if (activePrice > maxPrice) {
        return false;
      }

      // Stock filter
      if (onlyInStock && product.stock <= 0) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && product.ratingAvg < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;

      if (sortOption === "price-low") return priceA - priceB;
      if (sortOption === "price-high") return priceB - priceA;
      if (sortOption === "rating") return b.ratingAvg - a.ratingAvg;
      return 0; // Default newest
    });
  }, [initialProducts, selectedCategory, searchQuery, sortOption, maxPrice, onlyInStock, minRating]);

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug === "all") {
      params.delete("category");
    } else {
      params.set("category", categorySlug);
    }
    const query = params.toString();
    router.push(`/products${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    const query = params.toString();
    router.push(`/products${query ? `?${query}` : ""}`, { scroll: false });
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortOption("newest");
    setMaxPrice(30000);
    setOnlyInStock(false);
    setMinRating(0);
    router.push("/products");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredProducts.length} of {initialProducts.length} premium products
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort by:</span>
          </div>
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Sidebar Filters */}
        <div className="space-y-6 lg:border-r lg:pr-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 h-8 px-2"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
          </div>

          {/* Search inside catalog */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Filter by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</Label>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategorySelect("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <span>All Departments</span>
                <span className="text-xs">{initialProducts.length}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs">{cat._count?.products ?? ""}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Price</Label>
              <span className="text-sm font-bold text-primary">{formatPrice(maxPrice)}</span>
            </div>
            <Slider
              value={[maxPrice]}
              min={1000}
              max={30000}
              step={500}
              onValueChange={(val) => setMaxPrice(val[0])}
            />
          </div>

          {/* Stock & Rating Checkboxes */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={onlyInStock}
                onCheckedChange={(checked) => setOnlyInStock(!!checked)}
              />
              <Label htmlFor="in-stock" className="text-sm font-medium cursor-pointer">
                In Stock Only
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</Label>
              <div className="space-y-1.5">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center justify-between transition ${
                      minRating === stars ? "bg-accent font-bold" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>{stars}★ & above</span>
                    {minRating === stars && <span className="text-primary font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border rounded-2xl bg-muted/20 flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <PackageX className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">No products match your filters</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting the price slider, changing category, or resetting your search term.
                </p>
              </div>
              <Button variant="outline" onClick={resetFilters} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={Number(product.price)}
                  discountPrice={product.discountPrice ? Number(product.discountPrice) : null}
                  image={product.images[0]?.url}
                  categoryName={product.category?.name}
                  ratingAvg={Number(product.ratingAvg)}
                  ratingCount={product.ratingCount}
                  stock={product.stock}
                  isFeatured={product.isFeatured}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

