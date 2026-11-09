import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { deleteDraft, listQuotes } from '../storage/quotes-repo'
import { listClients } from '../storage/clients-repo'
import { getSettings } from '../storage/profile-repo'
import { calcTotals } from '../domain/calc'
import { formatDate, formatInstantBogota } from '../domain/dates'
import { formatCOP } from '../domain/money'
import { M, describeStorageError } from '../app/messages'
import type { Client, Quote } from '../domain/types'

export default function QuotesList() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [pct, setPct] = useState(11)
  const [error, setError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<string | null>(null)

  async function refresh() {
    try {
      setClients(await listClients())
      setPct((await getSettings()).withholdingPct)
      setQuotes(await listQuotes())
    } catch (e) {
      setError(describeStorageError(e))
      setQuotes((q) => q ?? [])
    }
  }
  useEffect(() => { void refresh() }, [])

  async function onDelete() {
    const id = toDelete
    setToDelete(null)
    if (!id) return
    try {
      await deleteDraft(id)
      await refresh()
    } catch (e) {
      setError(describeStorageError(e))
    }
  }

  return (
    <div>
      <div className="row-between">
        <h1>Presupuestos</h1>
        <Link className="btn btn-primary" href="/presupuestos/nuevo">Nuevo presupuesto</Link>
      </div>
      {error && <div className="notice-error">{error}</div>}
      {quotes && quotes.length === 0 && <p className="muted">{M.noQuotes}</p>}
      {quotes?.map((q) => {
        let clientName: string | null = null
        let total: number | null = null
        if (q.status === 'COMPLETO') {
          clientName = q.client.name
          total = q.totals.total
        } else {
          const c = clients.find((x) => x.id === q.clientId) ?? null
          clientName = c?.name ?? null
          total = calcTotals(q.lines, c, pct).total
        }
        return (
          <div className="card" key={q.id}>
            <Link className="list-item" href={`/presupuestos/${q.id}`}>
              <div className="row-between">
                <span className="title">{q.status === 'COMPLETO' ? q.number : 'Sin número'}</span>
                <span className={`badge ${q.status === 'COMPLETO' ? 'badge-completo' : 'badge-borrador'}`}>{q.status}</span>
              </div>
              {q.status === 'COMPLETO'
                ? <div className="muted">Emitido: {formatDate(q.issueDate)}</div>
                : <div className="muted">Última modificación: {formatInstantBogota(q.updatedAt)}</div>}
              {clientName && <div>{clientName}</div>}
              {total !== null && <div><strong>{formatCOP(total)}</strong></div>}
            </Link>
            {q.status === 'BORRADOR' && (
              <div className="actions"><button className="btn btn-danger" onClick={() => setToDelete(q.id)}>Eliminar</button></div>
            )}
          </div>
        )
      })}
      {toDelete && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <div className="dialog">
            <p>{M.confirmDeleteDraft}</p>
            <div className="actions">
              <button className="btn" onClick={() => setToDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={onDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
