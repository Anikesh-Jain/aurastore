"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  MapPin,
  Plus,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

interface CheckoutClientProps {
  savedAddresses: Address[];
}

export function CheckoutClient({ savedAddresses }: CheckoutClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, coupon, clearCart, getSubtotal, getDiscountAmount, getShippingFee, getFinalTotal } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find((a) => a.isDefault)?.id || savedAddresses[0]?.id || "new"
  );

  const [newAddress, setNewAddress] = useState({
    fullName: session?.user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 border rounded-2xl bg-muted/20 max-w-lg mx-auto p-8 space-y-4 my-12">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
        <Button asChild>
          <Link href="/products">Shop Catalog</Link>
        </Button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingFee();
  const finalTotal = getFinalTotal();

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAddressId === "new") {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.postalCode) {
        toast.error("Please fill in all required shipping address fields.");
        return;
      }
    }

    setProcessing(true);

    try {
      // 1. Initialize Order in Database
      const createOrderRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            image: item.image,
          })),
          addressId: selectedAddressId !== "new" ? selectedAddressId : undefined,
          newAddress: selectedAddressId === "new" ? newAddress : undefined,
          couponCode: coupon?.code,
          paymentMethod,
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok) {
        toast.error(orderData.error || "Failed to create order.");
        setProcessing(false);
        return;
      }

      // 2. Handle Payment Flow
      if (paymentMethod === "COD" || orderData.isMock) {
        // Direct sandbox verification
        toast.info("Verifying order and securing inventory...");
        const verifyRes = await fetch("/api/checkout/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: `mock_pay_${Date.now()}`,
            razorpaySignature: "mock_signature",
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
          clearCart();
          toast.success("Order confirmed successfully!");
          router.push(`/checkout/success/${orderData.orderId}`);
        } else {
          toast.error(verifyData.error || "Payment verification failed.");
          setProcessing(false);
        }
      } else {
        // Live Razorpay Checkout Modal
        if (!window.Razorpay) {
          toast.error("Razorpay SDK could not be loaded. Please refresh.");
          setProcessing(false);
          return;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "AuraStore Marketplace",
          description: `Payment for Order #${orderData.orderNumber}`,
          order_id: orderData.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/checkout/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              if (verifyRes.ok) {
                clearCart();
                toast.success("Payment verified and order placed!");
                router.push(`/checkout/success/${orderData.orderId}`);
              } else {
                toast.error("Signature verification failed.");
                setProcessing(false);
              }
            } catch (err) {
              toast.error("Error during payment confirmation.");
              setProcessing(false);
            }
          },
          prefill: {
            name: session?.user?.name || newAddress.fullName,
            email: session?.user?.email || "",
            contact: newAddress.phone || "",
          },
          theme: {
            color: "#2563eb",
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
              toast.info("Payment cancelled.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error("An unexpected error occurred during checkout.");
      setProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="container mx-auto px-4 py-8">
        <div className="pb-6 border-b mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Lock className="w-7 h-7 text-primary" /> Secure Checkout
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your shipping and payment details below.
          </p>
        </div>

        <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Addresses & Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> 1. Shipping Address
                </CardTitle>
                <CardDescription>Select a saved delivery address or enter a new one.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedAddresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-foreground/30"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm">{addr.fullName}</h4>
                            {addr.isDefault && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            📞 {addr.phone}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div
                      onClick={() => setSelectedAddressId("new")}
                      className={`cursor-pointer p-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-sm font-medium transition ${
                        selectedAddressId === "new"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Plus className="w-4 h-4 text-primary" /> Enter New Address
                    </div>
                  </div>
                )}

                {/* New Address Fields */}
                {selectedAddressId === "new" && (
                  <div className="space-y-3 pt-2 border-t mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="Jane Doe"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="+91 9876543210"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="street">Street Address & Landmark *</Label>
                      <Input
                        id="street"
                        placeholder="House No., Building, Street Name"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Bengaluru"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="Karnataka"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="postalCode">Postal PIN Code *</Label>
                        <Input
                          id="postalCode"
                          placeholder="560038"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Payment Method */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> 2. Payment Method
                </CardTitle>
                <CardDescription>Select your preferred payment gateway.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      ₹
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Razorpay (UPI / Cards / NetBanking / Wallets)</h4>
                      <p className="text-xs text-muted-foreground">
                        Instant, secure, zero transaction fee online payment
                      </p>
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      paymentMethod === "RAZORPAY" ? "text-primary fill-primary/20" : "text-muted-foreground/30"
                    }`}
                  />
                </div>

                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition ${
                    paymentMethod === "COD"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Cash on Delivery (COD) / Demo Pay</h4>
                      <p className="text-xs text-muted-foreground">Pay via cash upon package delivery</p>
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      paymentMethod === "COD" ? "text-primary fill-primary/20" : "text-muted-foreground/30"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Review */}
          <div className="space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Order Review ({items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="relative w-12 h-12 rounded bg-muted overflow-hidden shrink-0 border">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-xs">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-xs font-bold text-right">
                        {formatPrice((item.discountPrice ?? item.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Promo Discount ({coupon?.code})</span>
                      <span className="font-semibold">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between items-baseline">
                    <span className="text-base font-bold">Total to Pay</span>
                    <span className="text-2xl font-extrabold text-primary">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={processing}
                  className="w-full mt-4 rounded-xl shadow-md font-bold h-12 gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                    </>
                  ) : (
                    <>
                      Pay {formatPrice(finalTotal)} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted 256-Bit SSL Razorpay Gateway</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span>Instant Resend Confirmation Email dispatched</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

