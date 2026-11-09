import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getDb, resetDbForTests, StorageUnavailableError } from '../../src/storage/db'
import { freshDb } from './helpers'

beforeEach(freshDb)

describe('db', () => {
  it('crea los seis almacenes y el índice único codeKey', async () => {
    const db = await getDb()
    expect([...db.objectStoreNames].sort()).toEqual(['clients', 'counters', 'profile', 'quotes', 'services', 'settings'])
    const tx = db.transaction('services')
    expect(tx.store.index('codeKey').unique).toBe(true)
  })
  it('persiste al cerrar y reabrir', async () => {
    const db = await getDb()
    await db.put('clients', { id: 'a', name: 'Ana', type: 'PERSONA_NATURAL' })
    await resetDbForTests()
    const db2 = await getDb()
    expect((await db2.get('clients', 'a')).name).toBe('Ana')
  })
  describe('fallo al abrir', () => {
    const real = globalThis.indexedDB
    afterEach(() => {
      vi.unstubAllGlobals()
      globalThis.indexedDB = real
    })
    it('lanza StorageUnavailableError con el mensaje del contrato', async () => {
      await resetDbForTests()
      vi.stubGlobal('indexedDB', { open: () => { throw new Error('bloqueado') } })
      await expect(getDb()).rejects.toBeInstanceOf(StorageUnavailableError)
      await expect(getDb()).rejects.toThrow(
        'No se puede guardar información en este navegador. Revisa que no estés en modo privado y que haya espacio disponible.',
      )
    })
  })
})
