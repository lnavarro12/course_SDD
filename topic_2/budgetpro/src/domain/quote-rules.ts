import type { Client, Profile, QuoteLine } from './types'

export function isLineValid(line: QuoteLine): boolean {
  return (
    line.description.trim() !== '' &&
    line.quantityHundredths != null &&
    line.quantityHundredths > 0 &&
    line.unitPrice != null &&
    line.unitPrice >= 0
  )
}

export function validateForCompletion(
  quote: { lines: QuoteLine[] },
  client: Client | null | undefined,
  profile: Profile | null | undefined,
): string[] {
  const errors: string[] = []
  if (!client) errors.push('Selecciona un cliente.')
  if (quote.lines.length === 0) errors.push('Agrega al menos una línea.')
  quote.lines.forEach((l, i) => {
    const n = i + 1
    if (l.description.trim() === '') errors.push(`La línea ${n} necesita una descripción.`)
    if (l.quantityHundredths == null || !(l.quantityHundredths > 0))
      errors.push(`La cantidad de la línea ${n} debe ser mayor que cero.`)
    if (l.unitPrice == null || !(l.unitPrice >= 0))
      errors.push(`El precio de la línea ${n} no puede ser negativo.`)
  })
  if (!profile || !profile.name?.trim() || !profile.taxId?.trim())
    errors.push('Completa tu nombre y NIT/CC en Perfil.')
  return errors
}

/**
 * En el borrador, "no numérico" se representa con `undefined`/NaN en los valores
 * (la pantalla conserva el texto aparte). Vacío (null) es válido en un borrador.
 */
export function validateDraftNumbers(lines: QuoteLine[]): string[] {
  const errors = new Set<string>()
  for (const l of lines) {
    const q = l.quantityHundredths as number | null | undefined
    const p = l.unitPrice as number | null | undefined
    if (q !== null && (q === undefined || Number.isNaN(q) || typeof q !== 'number'))
      errors.add('La cantidad debe ser un número.')
    if (p !== null && (p === undefined || Number.isNaN(p) || typeof p !== 'number'))
      errors.add('El precio debe ser un número.')
  }
  return [...errors]
}
