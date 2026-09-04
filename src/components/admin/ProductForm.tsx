"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  Loader2,
  X,
  Check,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface ImageItem {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
}

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    sku?: string | null;
    categoryId: string;
    isFeatured: boolean;
    isActive: boolean;
    images: ImageItem[];
  };
  categories: Category[];
  isEditing?: boolean;
}

export function ProductForm({ initialData, categories, isEditing }: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [discountPrice, setDiscountPrice] = useState(initialData?.discountPrice?.toString() || "");
  const [stock, setStock] = useState(initialData?.stock?.toString() || "10");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isActive, setIsActive] = useState(initialData?.isActive !== undefined ? initialData.isActive : true);

  const [images, setImages] = useState<ImageItem[]>(initialData?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  // Upload to Cloudinary via server API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "ecommerce-products");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to upload image.");
      } else {
        setImages((prev) => [
          ...prev,
          {
            url: data.url,
            publicId: data.publicId,
            isPrimary: prev.length === 0,
          },
        ]);
        toast.success("Image uploaded to Cloudinary!");
      }
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;

    setImages((prev) => [
      ...prev,
      {
        url: imageUrlInput.trim(),
        isPrimary: prev.length === 0,
      },
    ]);
    setImageUrlInput("");
    toast.success("Image URL added!");
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug || !price || !categoryId) {
      toast.error("Please fill in all required fields (Name, Slug, Price, Category).");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one product photo.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        slug,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock) || 0,
        sku: sku || undefined,
        categoryId,
        isFeatured,
        isActive,
        images,
      };

      const url = isEditing
        ? `/api/admin/products/${initialData?.id}`
        : "/api/products";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save product.");
      } else {
        toast.success(isEditing ? "Product updated successfully!" : "Product created!");
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/admin/products">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isEditing ? `Edit: ${initialData?.name}` : "Create New Product"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in product specifications, pricing, inventory, and Cloudinary media assets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              isEditing ? "Save Changes" : "Publish Product"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Info & Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Product Title *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Aura Pro Wireless ANC Headphones"
                  value={name}
                  onChange={handleNameChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  placeholder="e.g. aura-pro-wireless-anc-headphones"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Detailed Description *</Label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Detailed product features, materials, and warranty specifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Photos */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Product Media Gallery (Cloudinary)
              </CardTitle>
              <CardDescription>Upload photos or enter image URLs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed rounded-lg text-xs font-semibold hover:bg-muted transition shrink-0 bg-primary/5 border-primary/30 text-primary">
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingImage ? "Uploading to Cloudinary..." : "Upload from Device"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Or paste image URL (e.g. Unsplash / Cloudinary)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="button" variant="outline" onClick={handleAddImageUrl} size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Images Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 group ${
                        img.isPrimary ? "border-primary ring-2 ring-primary/20" : "border-border"
                      }`}
                    >
                      <Image src={img.url} alt="Product" fill className="object-cover" />

                      {img.isPrimary && (
                        <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          PRIMARY
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className="bg-primary text-white p-1.5 rounded-full hover:scale-110 transition"
                            title="Set as Primary"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="bg-destructive text-white p-1.5 rounded-full hover:scale-110 transition"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Pricing & Organization */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Pricing (₹ INR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Regular Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="19999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discountPrice">Discount / Sale Price (₹)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  placeholder="16999"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory & Category */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Inventory & Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="categoryId">Department / Category *</Label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock">Available Stock Units *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="25"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU Code</Label>
                <Input
                  id="sku"
                  placeholder="AUR-PRD-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={(c) => setIsFeatured(!!c)}
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer text-xs font-semibold">
                    Feature on Homepage Spotlight
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(c) => setIsActive(!!c)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer text-xs font-semibold">
                    Active & Visible in Catalog
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

