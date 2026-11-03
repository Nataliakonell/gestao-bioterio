import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openInNewTab(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
