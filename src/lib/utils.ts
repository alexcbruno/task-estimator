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

export type Intensity = 'low' | 'med' | 'high'

export const INTENSITY_MULTIPLIER: Record<Intensity, number> = {
  low: 0.25,
  med: 0.5,
  high: 1,
}

// Map of criterion id -> chosen intensity. A criterion is "checked" iff it has a key.
export type Selections = Record<string, Intensity>

export function getPoints(selections: Selections): number {
  return CRITERIA.reduce((sum, c) => {
    const intensity = selections[c.id]
    if (!intensity) return sum
    return sum + c.points * INTENSITY_MULTIPLIER[intensity]
  }, 0)
}
