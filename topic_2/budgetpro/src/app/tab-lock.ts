export type TabLockResult = 'acquired' | 'taken' | 'unsupported'

let pending: Promise<TabLockResult> | null = null

/** Memoizado por página: llamadas repetidas (p. ej. StrictMode) comparten el mismo resultado. */
export function acquireTabLock(): Promise<TabLockResult> {
  if (!pending) pending = requestTabLock()
  return pending
}

function requestTabLock(): Promise<TabLockResult> {
  const locks = (navigator as Navigator & { locks?: LockManager }).locks
  if (!locks) return Promise.resolve('unsupported')
  return new Promise<TabLockResult>((resolve) => {
    locks
      .request('presupuestospro-editor', { ifAvailable: true }, (lock) => {
        if (!lock) {
          resolve('taken')
          return undefined
        }
        resolve('acquired')
        // Mantiene el turno mientras la pestaña viva.
        return new Promise<void>(() => {})
      })
      .catch(() => resolve('unsupported'))
  })
}
