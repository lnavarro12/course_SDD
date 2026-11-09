import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { Link, useLocation } from 'wouter'
import { M } from './messages'

/** Contexto simple: el editor marca si hay cambios sin guardar. */
interface GuardCtx {
  setDirty: (d: boolean) => void
  dirtyRef: { current: boolean }
  confirmLeave: (go: () => void) => void
}
const Ctx = createContext<GuardCtx | null>(null)

export function useGuard() {
  const c = useContext(Ctx)
  if (!c) throw new Error('GuardProvider ausente')
  return c
}

export function GuardProvider({ children }: { children: ReactNode }) {
  const dirtyRef = useRef(false)
  const [pending, setPending] = useState<null | (() => void)>(null)
  const [location] = useLocation()
  const lastLocation = useRef(location)

  const confirmLeave = (go: () => void) => {
    if (dirtyRef.current) setPending(() => go)
    else go()
  }

  // Botón atrás / cambio de hash directo
  useEffect(() => {
    const onHash = () => {
      const now = window.location.hash
      if (dirtyRef.current && lastLocation.current !== now) {
        const target = now
        history.pushState(null, '', lastLocation.current)
        setPending(() => () => {
          dirtyRef.current = false
          window.location.hash = target
        })
      } else {
        lastLocation.current = now
      }
    }
    lastLocation.current = window.location.hash
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!dirtyRef.current) lastLocation.current = window.location.hash
  }, [location])

  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBefore)
    return () => window.removeEventListener('beforeunload', onBefore)
  }, [])

  const setDirty = (d: boolean) => {
    dirtyRef.current = d
    if (!d) lastLocation.current = window.location.hash
  }

  return (
    <Ctx.Provider value={{ setDirty, dirtyRef, confirmLeave }}>
      {children}
      {pending && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <div className="dialog">
            <p>{M.unsavedChanges}</p>
            <div className="actions">
              <button className="btn" onClick={() => setPending(null)}>Quedarme</button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  const go = pending
                  dirtyRef.current = false
                  setPending(null)
                  go()
                }}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

export function GuardedLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  const { dirtyRef, confirmLeave } = useGuard()
  const [, navigate] = useLocation()
  const onClick = (e: MouseEvent) => {
    if (dirtyRef.current) {
      e.preventDefault()
      confirmLeave(() => navigate(href))
    }
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
