import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string | { toString(): string },
  currency: string = "INR"
) {
  const numericPrice = typeof price === "number" ? price : Number(price);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export function truncateText(text: string, maxLength: number = 60) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (!originalPrice || originalPrice <= discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

