import type { Quote } from '../domain/types'

export interface QuoteCounts {
  borradores: number
  completos: number
  total: number
}

/** Conteo de presupuestos por estado; coincide siempre con las filas del listado. */
export function countByStatus(quotes: Quote[]): QuoteCounts {
  let borradores = 0
  let completos = 0
  for (const q of quotes) {
    if (q.status === 'BORRADOR') borradores++
    else if (q.status === 'COMPLETO') completos++
  }
  return { borradores, completos, total: borradores + completos }
}
