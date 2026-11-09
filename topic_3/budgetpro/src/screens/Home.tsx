import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { GuardedLink } from '../app/GuardedLink'
import { SECTIONS } from '../app/sections'
import { describeStorageError } from '../app/messages'
import { listQuotes } from '../storage/quotes-repo'
import { countByStatus, type QuoteCounts } from './home-summary'

export default function Home() {
  const [counts, setCounts] = useState<QuoteCounts | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listQuotes()
      .then((qs) => setCounts(countByStatus(qs)))
      .catch((e) => setError(describeStorageError(e)))
  }, [])

  const empty = counts !== null && counts.total === 0

  return (
    <div>
      <div className="home-hero">
        <h1>PresupuestosPro</h1>
      </div>
      {error && <div className="notice-error">{error}</div>}
      {!error && counts === null && <p className="muted">Cargando…</p>}
      {counts && (
        <div className="home-stats">
          <div className="card home-stat">
            <span className="home-count">{counts.borradores}</span>
            <span className="badge badge-borrador">BORRADOR</span>
            <span className="home-label">Borradores</span>
          </div>
          <div className="card home-stat">
            <span className="home-count">{counts.completos}</span>
            <span className="badge badge-completo">COMPLETO</span>
            <span className="home-label">Completos</span>
          </div>
          <div className="card home-stat">
            <span className="home-count">{counts.total}</span>
            <span className="home-label">Total</span>
          </div>
        </div>
      )}
      <div className="actions">
        <Link className={empty ? 'btn btn-primary' : 'btn'} href="/presupuestos/nuevo">Nuevo presupuesto</Link>
      </div>
      <div className="home-links">
        {SECTIONS.filter((s) => s.href !== '/').map((s) => (
          <div className="card home-link" key={s.href}>
            <GuardedLink href={s.href} className="list-item">
              <span className="title">{s.label}</span>
              <span className="muted">{s.description}</span>
            </GuardedLink>
          </div>
        ))}
      </div>
    </div>
  )
}
