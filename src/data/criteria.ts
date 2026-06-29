export interface Criterion {
  id: string
  label: string
  points: number
}

// Edit this array to add, remove, or reweight criteria.
// Point values are hidden from the user during estimation.
export const CRITERIA: Criterion[] = [
  { id: 'new-endpoint',   label: 'Requires a new API endpoint',              points: 2 },
  { id: 'db-change',      label: 'Requires database schema changes',          points: 3 },
  { id: 'auth',           label: 'Touches authentication or permissions',      points: 2 },
  { id: 'third-party',    label: 'Involves a third-party integration',         points: 3 },
  { id: 'ui-complex',     label: 'Complex UI interactions or state',           points: 2 },
  { id: 'business-logic', label: 'Non-trivial business logic',                 points: 3 },
  { id: 'migration',      label: 'Requires data migration or backfill',        points: 3 },
  { id: 'cross-team',     label: 'Requires coordination across teams',         points: 2 },
  { id: 'unknown',        label: 'Significant unknowns or research needed',    points: 3 },
  { id: 'performance',    label: 'Has specific performance requirements',       points: 2 },
]
