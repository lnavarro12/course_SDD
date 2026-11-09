import { describe, it, expect } from 'vitest'
import { countByStatus } from '../../src/screens/home-summary'
import type { Quote } from '../../src/domain/types'

const draft = (id: string): Quote => ({
  id, status: 'BORRADOR', clientId: null, lines: [], createdAt: '2026-11-09T10:00:00Z', updatedAt: '2026-11-09T10:00:00Z',
})
const complete = (id: string): Quote =>
  ({
    id, status: 'COMPLETO', number: `P-${id}`, lines: [], createdAt: '2026-11-09T10:00:00Z', updatedAt: '2026-11-09T10:00:00Z',
  }) as unknown as Quote

describe('countByStatus', () => {
  it('lista vacía → ceros', () => {
    expect(countByStatus([])).toEqual({ borradores: 0, completos: 0, total: 0 })
  })
  it('cuenta borradores y completos', () => {
    const qs = [draft('1'), complete('2'), draft('3'), complete('4'), complete('5')]
    expect(countByStatus(qs)).toEqual({ borradores: 2, completos: 3, total: 5 })
  })
  it('el total coincide con la cantidad de filas', () => {
    const qs = [draft('1'), complete('2'), complete('3')]
    expect(countByStatus(qs).total).toBe(qs.length)
  })
})
