import { resetDbForTests, DB_NAME } from '../../src/storage/db'

export async function freshDb() {
  await resetDbForTests()
  await new Promise<void>((resolve, reject) => {
    const r = indexedDB.deleteDatabase(DB_NAME)
    r.onsuccess = () => resolve()
    r.onerror = () => reject(r.error)
    r.onblocked = () => resolve()
  })
}
