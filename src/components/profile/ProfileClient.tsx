"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Mail,
  ShieldCheck,
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface ProfileClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    createdAt: string;
  };
  initialAddresses: Address[];
}

export function ProfileClient({ user, initialAddresses }: ProfileClientProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add address.");
      } else {
        toast.success("Delivery address added!");
        setAddresses((prev) => [data.address, ...prev]);
        setShowAddressForm(false);
        setFormData({
          fullName: user.name || "",
          phone: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          isDefault: false,
        });
        router.refresh();
      }
    } catch (err) {
      toast.error("Error creating address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/user/address?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toast.success("Address removed.");
        router.refresh();
      } else {
        toast.error("Failed to delete address.");
      }
    } catch (err) {
      toast.error("Error deleting address.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Page Title */}
      <div className="pb-6 border-b">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-primary" /> My Account
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal details, credentials, and saved shipping addresses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <Card className="shadow-sm md:col-span-1 h-fit">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-2xl mb-2">
              {user.name?.[0] || "U"}
            </div>
            <CardTitle className="text-lg">{user.name || "Customer"}</CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Account Role:
              </span>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="font-bold">
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Member Since:
              </span>
              <span className="font-medium text-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Addresses Section */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Saved Delivery Addresses
                </CardTitle>
                <CardDescription>Addresses used for fast 1-click checkout.</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddressForm(!showAddressForm)}
                variant={showAddressForm ? "outline" : "default"}
                className="gap-1"
              >
                {showAddressForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Address</>}
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleCreateAddress} className="p-4 rounded-xl border bg-muted/20 space-y-3 mb-4">
                  <h4 className="font-bold text-sm">Add New Delivery Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-xs">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="street" className="text-xs">Street Address *</Label>
                    <Input
                      id="street"
                      placeholder="Building, Street, Landmark"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-xs">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="state" className="text-xs">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="postalCode" className="text-xs">PIN Code *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" size="sm" disabled={saving} className="w-full sm:w-auto">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Delivery Address"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Address List */}
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No saved addresses found. Click &quot;Add Address&quot; above to add one.
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-xl border bg-card flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{addr.street}</p>
                        <p className="text-muted-foreground">
                          {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                        </p>
                        <p className="font-mono text-muted-foreground pt-1">📞 {addr.phone}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

