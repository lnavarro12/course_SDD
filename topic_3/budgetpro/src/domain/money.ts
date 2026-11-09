/** Redondeo "medio hacia arriba" con enteros (solo no negativos). */
export function roundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator))
}

export function formatCOP(n: number): string {
  const abs = Math.abs(Math.trunc(n))
  const s = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${n < 0 ? '-' : ''}$${s}`
}

export function formatQuantity(hundredths: number): string {
  const whole = Math.trunc(hundredths / 100)
  const frac = Math.abs(hundredths % 100)
  if (frac === 0) return String(whole)
  const f = String(frac).padStart(2, '0').replace(/0$/, '')
  return `${whole},${f}`
}

/** Devuelve centésimas o null si el texto no es numérico (máx. 2 decimales). */
export function parseQuantity(text: string): number | null {
  const t = text.trim()
  const m = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(t)
  if (!m) return null
  const frac = (m[2] ?? '').padEnd(2, '0')
  return Number(m[1]) * 100 + Number(frac || '0')
}

/** Devuelve un entero de pesos o null si no es numérico. Se aceptan separadores de miles con punto. */
export function parsePrice(text: string): number | null {
  const t = text.trim().replace(/^\$/, '')
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ''))
  if (/^\d+$/.test(t)) return Number(t)
  return null
}
