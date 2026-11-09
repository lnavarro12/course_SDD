import { openDB, type IDBPDatabase } from 'idb'

export const STORAGE_UNAVAILABLE_MESSAGE =
  'No se puede guardar información en este navegador. Revisa que no estés en modo privado y que haya espacio disponible.'

export class StorageUnavailableError extends Error {
  constructor(message = STORAGE_UNAVAILABLE_MESSAGE) {
    super(message)
    this.name = 'StorageUnavailableError'
  }
}

export const DB_NAME = 'presupuestospro'

export async function openAppDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore('profile')
      db.createObjectStore('settings')
      db.createObjectStore('clients', { keyPath: 'id' })
      const services = db.createObjectStore('services', { keyPath: 'id' })
      services.createIndex('codeKey', 'codeKey', { unique: true })
      const quotes = db.createObjectStore('quotes', { keyPath: 'id' })
      quotes.createIndex('status', 'status')
      quotes.createIndex('updatedAt', 'updatedAt')
      db.createObjectStore('counters')
    },
  })
}

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        return await openAppDb()
      } catch {
        throw new StorageUnavailableError()
      }
    })()
    dbPromise.catch(() => {
      dbPromise = null
    })
  }
  return dbPromise
}

/** Solo para pruebas: cierra y olvida la conexión memoizada. */
export async function resetDbForTests(): Promise<void> {
  if (dbPromise) {
    try {
      ;(await dbPromise).close()
    } catch {
      /* ignorar */
    }
  }
  dbPromise = null
}

export function newId(): string {
  return crypto.randomUUID()
}
