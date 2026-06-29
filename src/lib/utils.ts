import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CRITERIA } from '../data/criteria'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FIBONACCI = [1, 2, 3, 5, 8, 13, 21]

export function roundUpToFibonacci(n: number): number {
  if (n <= 0) return 1
  for (const fib of FIBONACCI) {
    if (fib >= n) return fib
  }
  return 21
}

export function getPoints(selectedIds: string[]): number {
  return CRITERIA
    .filter(c => selectedIds.includes(c.id))
    .reduce((sum, c) => sum + c.points, 0)
}
