import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format tiền tệ VND: formatCurrency(738400) -> "738.400 ₫" */
export function formatCurrency(value: number, currency = "VND", locale = "vi-VN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format ngày: formatDate(date) -> "20/07/2026" */
export function formatDate(date: Date | string | number, pattern = "dd/MM/yyyy"): string {
  return format(new Date(date), pattern)
}

/** Format ngày giờ: formatDateTime(date) -> "20/07/2026 11:25" */
export function formatDateTime(date: Date | string | number, pattern = "dd/MM/yyyy HH:mm"): string {
  return format(new Date(date), pattern)
}
