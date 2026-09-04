"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, FolderTree, Upload, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  _count?: { products: number };
}

interface AdminCategoriesClientProps {
  initialCategories: Category[];
}

export function AdminCategoriesClient({ initialCategories }: AdminCategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publicId, setPublicId] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "ecommerce-categories");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setImageUrl(data.url);
        setPublicId(data.publicId);
        toast.success("Category image uploaded!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Name and slug are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          imageUrl,
          publicId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create category.");
      } else {
        toast.success("Category created successfully!");
        setCategories((prev) => [...prev, data.category]);
        setShowForm(false);
        setName("");
        setSlug("");
        setDescription("");
        setImageUrl("");
        setPublicId("");
        router.refresh();
      }
    } catch (err) {
      toast.error("Error creating category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete category.");
      } else {
        toast.success(`Category "${catName}" deleted.`);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (err) {
      toast.error("Error deleting category.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Category Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize products into hierarchical departments and collections.
          </p>
        </div>

        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5 shadow-sm">
          {showForm ? "Close Form" : <><Plus className="w-4 h-4" /> Add New Category</>}
        </Button>
      </div>

      {/* Create Category Card */}
      {showForm && (
        <Card className="shadow-md border-primary/20 bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Create Category</CardTitle>
            <CardDescription>Add a new store department with cover imagery.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="catName">Category Name *</Label>
                  <Input
                    id="catName"
                    placeholder="e.g. Smart Watches"
                    value={name}
                    onChange={handleNameChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="catSlug">URL Slug *</Label>
                  <Input
                    id="catSlug"
                    placeholder="e.g. smart-watches"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catDesc">Description</Label>
                <Input
                  id="catDesc"
                  placeholder="Short department overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Category Cover Image */}
              <div className="space-y-2">
                <Label>Cover Image (Cloudinary)</Label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg text-xs font-semibold hover:bg-muted transition">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-4 h-4 text-primary" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload Cover"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <Input
                    placeholder="Or paste image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="text-xs flex-1"
                  />
                </div>

                {imageUrl && (
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border mt-2">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="mt-2">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Category"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b uppercase text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Cover</th>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Slug</th>
                  <th className="p-3.5">Products</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/20 transition">
                    <td className="p-3.5">
                      <div className="relative w-12 h-10 rounded-md overflow-hidden bg-muted border">
                        <Image
                          src={cat.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80"}
                          alt={cat.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-foreground text-sm">{cat.name}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">/{cat.slug}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-primary">{cat._count?.products ?? 0} items</span>
                    </td>
                    <td className="p-3.5 text-muted-foreground max-w-xs truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

