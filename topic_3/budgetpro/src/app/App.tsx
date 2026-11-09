import { useEffect, useState } from 'react'
import { Router, Route, Switch, useLocation } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { acquireTabLock } from './tab-lock'
import { GuardProvider, GuardedLink } from './GuardedLink'
import { getDb } from '../storage/db'
import { describeStorageError } from './messages'
import AlreadyOpen from '../screens/AlreadyOpen'
import QuotesList from '../screens/QuotesList'
import QuoteEditor from '../screens/QuoteEditor'
import QuotePreview from '../screens/QuotePreview'
import Clients from '../screens/Clients'
import Services from '../screens/Services'
import Settings from '../screens/Settings'
import Home from '../screens/Home'
import { SECTIONS } from './sections'

function Nav() {
  const [loc] = useLocation()
  return (
    <nav className="nav">
      {SECTIONS.map((n) => {
        const active =
          n.href === '/'
            ? loc === '/'
            : n.href === '/presupuestos'
              ? loc === '/presupuestos' || loc.startsWith('/presupuestos/')
              : loc.startsWith(n.href)
        return (
          <GuardedLink key={n.href} href={n.href} className={active ? 'active' : ''}>
            {n.label}
          </GuardedLink>
        )
      })}
    </nav>
  )
}

export default function App() {
  const [lock, setLock] = useState<'loading' | 'ok' | 'taken'>('loading')
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    acquireTabLock().then((r) => {
      if (!cancelled) setLock(r === 'taken' ? 'taken' : 'ok')
    })
    try {
      void navigator.storage?.persist?.()?.catch?.(() => {})
    } catch {
      /* sin bloqueo */
    }
    getDb().catch((e) => setStorageError(describeStorageError(e)))
    return () => {
      cancelled = true
    }
  }, [])

  if (lock === 'loading') return <div className="fullscreen-notice muted">Cargando…</div>
  if (lock === 'taken') return <AlreadyOpen />
  if (storageError)
    return (
      <div className="fullscreen-notice">
        <div className="notice-error">{storageError}</div>
      </div>
    )

  return (
    <Router hook={useHashLocation}>
      <GuardProvider>
        <Nav />
        <main className="app-main">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/presupuestos" component={QuotesList} />
            <Route key="nuevo" path="/presupuestos/nuevo" component={QuoteEditor} />
            <Route path="/presupuestos/:id/vista" component={QuotePreview} />
            <Route key="editar" path="/presupuestos/:id" component={QuoteEditor} />
            <Route path="/clientes" component={Clients} />
            <Route path="/servicios" component={Services} />
            <Route path="/configuracion" component={Settings} />
            <Route>
              <div className="notice-info">{'Esta dirección no existe.'}</div>
            </Route>
          </Switch>
        </main>
      </GuardProvider>
    </Router>
  )
}
