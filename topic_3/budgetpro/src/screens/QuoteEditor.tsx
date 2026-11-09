import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'wouter'
import { GuardedLink, useGuard } from '../app/GuardedLink'
import { ClientForm } from './Clients'
import { ServiceForm } from './Services'
import { M, catalogPriceChanged, describeStorageError, quoteSaved } from '../app/messages'
import { ValidationError } from '../domain/errors'
import { calcTotals, lineAmount, isLineCalculable } from '../domain/calc'
import { formatCOP, formatQuantity, parsePrice, parseQuantity } from '../domain/money'
import { formatDate } from '../domain/dates'
import { isLineValid, validateForCompletion } from '../domain/quote-rules'
import { getSettings, getProfile } from '../storage/profile-repo'
import { listClients } from '../storage/clients-repo'
import { getService, listServices, suggestCode } from '../storage/services-repo'
import { completeQuote, deleteDraft, getQuote, newId, saveDraft } from '../storage/quotes-repo'
import type { Client, CompleteQuote, DraftQuote, QuoteLine, Service, WithholdingPct } from '../domain/types'

/** Mensaje que se muestra tras redirigir al guardar un borrador nuevo. */
let flashMessage: string | null = null

interface LineState {
  id: string
  description: string
  qtyText: string
  priceText: string
  sourceServiceId?: string
  sourcePriceAtAdd?: number
}

function textToQty(t: string): number | null {
  if (t.trim() === '') return null
  const v = parseQuantity(t)
  return v === null ? NaN : v
}
function textToPrice(t: string): number | null {
  if (t.trim() === '') return null
  const v = parsePrice(t)
  return v === null ? NaN : v
}
function toLines(ls: LineState[]): QuoteLine[] {
  return ls.map((l) => ({
    id: l.id,
    description: l.description,
    quantityHundredths: textToQty(l.qtyText),
    unitPrice: textToPrice(l.priceText),
    sourceServiceId: l.sourceServiceId,
    sourcePriceAtAdd: l.sourcePriceAtAdd,
  }))
}
function fromLines(lines: QuoteLine[]): LineState[] {
  return lines.map((l) => ({
    id: l.id,
    description: l.description,
    qtyText: l.quantityHundredths == null ? '' : formatQuantity(l.quantityHundredths),
    priceText: l.unitPrice == null ? '' : String(l.unitPrice),
    sourceServiceId: l.sourceServiceId,
    sourcePriceAtAdd: l.sourcePriceAtAdd,
  }))
}

export default function QuoteEditor() {
  const { id } = useParams<{ id?: string }>()
  const [state, setState] = useState<
    { kind: 'loading' } | { kind: 'missing' } | { kind: 'draft'; draft: DraftQuote | null } | { kind: 'complete'; quote: CompleteQuote } | { kind: 'error'; msg: string }
  >({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!id) return setState({ kind: 'draft', draft: null })
      try {
        const q = await getQuote(id)
        if (cancelled) return
        if (!q) setState({ kind: 'missing' })
        else if (q.status === 'COMPLETO') setState({ kind: 'complete', quote: q })
        else setState({ kind: 'draft', draft: q })
      } catch (e) {
        if (!cancelled) setState({ kind: 'error', msg: describeStorageError(e) })
      }
    })()
    return () => { cancelled = true }
  }, [id])

  if (state.kind === 'loading') return <p className="muted">Cargando…</p>
  if (state.kind === 'missing') return <div className="notice-info">{M.quoteNotAvailable}</div>
  if (state.kind === 'error') return <div className="notice-error">{state.msg}</div>
  if (state.kind === 'complete') return <ReadOnlyQuote quote={state.quote} />
  return (
    <EditQuote
      initial={state.draft}
      onCompleted={(quote) => setState({ kind: 'complete', quote })}
    />
  )
}

function ReadOnlyQuote({ quote }: { quote: CompleteQuote }) {
  const isCompany = quote.client.type === 'EMPRESA'
  return (
    <div>
      <div className="row-between">
        <h1>Presupuesto {quote.number}</h1>
        <span className="badge badge-completo">COMPLETO</span>
      </div>
      <div className="actions">
        <Link className="btn btn-primary" href={`/presupuestos/${quote.id}/vista`}>Vista previa</Link>
        <Link className="btn" href={`/presupuestos/${quote.id}/vista`}>Descargar PDF</Link>
      </div>
      <div className="card">
        <div>Fecha de emisión: {formatDate(quote.issueDate)}</div>
        <div>Fecha de vencimiento: {formatDate(quote.dueDate)}</div>
      </div>
      <div className="card">
        <strong>Profesional</strong>
        <div>{quote.issuer.name}</div>
        <div>NIT/CC: {quote.issuer.taxId}</div>
        {quote.issuer.email && <div>{quote.issuer.email}</div>}
        {quote.issuer.phone && <div>{quote.issuer.phone}</div>}
        {quote.issuer.address && <div>{quote.issuer.address}</div>}
      </div>
      <div className="card">
        <strong>Cliente</strong>
        <div>{quote.client.name} · {isCompany ? 'Empresa' : 'Persona natural'}</div>
        {quote.client.taxId && <div>NIT/CC: {quote.client.taxId}</div>}
        {quote.client.email && <div>{quote.client.email}</div>}
        {quote.client.phone && <div>{quote.client.phone}</div>}
        {quote.client.address && <div>{quote.client.address}</div>}
      </div>
      <table className="table card">
        <thead><tr><th>Descripción</th><th className="num">Cantidad</th><th className="num">Precio unitario</th><th className="num">Importe</th></tr></thead>
        <tbody>
          {quote.lines.map((l) => (
            <tr key={l.id}>
              <td data-label="Descripción">{l.description}</td>
              <td className="num" data-label="Cantidad">{formatQuantity(l.quantityHundredths!)}</td>
              <td className="num" data-label="Precio unitario">{formatCOP(l.unitPrice!)}</td>
              <td className="num" data-label="Importe">{formatCOP(l.amount!)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="card summary">
        <div><span>Base</span><span>{formatCOP(quote.totals.base)}</span></div>
        <div><span>IVA (19 %)</span><span>{formatCOP(quote.totals.iva)}</span></div>
        {isCompany && (
          <div><span>Retención en la fuente ({quote.withholdingPctApplied} %)</span><span>{formatCOP(-quote.totals.withholding)}</span></div>
        )}
        <div className="total"><span>TOTAL</span><span>{formatCOP(quote.totals.total)}</span></div>
      </div>
    </div>
  )
}

function EditQuote({ initial, onCompleted }: { initial: DraftQuote | null; onCompleted: (q: CompleteQuote) => void }) {
  const [, navigate] = useLocation()
  const { setDirty } = useGuard()
  const quoteId = useRef(initial?.id ?? newId()).current
  const createdAt = useRef(initial?.createdAt ?? new Date().toISOString()).current
  const persisted = useRef(initial !== null)

  const [clientId, setClientId] = useState<string | null>(initial?.clientId ?? null)
  const [lines, setLines] = useState<LineState[]>(initial ? fromLines(initial.lines) : [])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [pct, setPct] = useState<WithholdingPct>(11)
  const [showClientForm, setShowClientForm] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [saveToCatalogFor, setSaveToCatalogFor] = useState<{ lineId: string; code: string } | null>(null)
  const [notices, setNotices] = useState<string[]>([])
  const [success, setSuccess] = useState<string | null>(flashMessage)
  const [error, setError] = useState<string | null>(null)
  const [errorList, setErrorList] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const snapshot = (cid: string | null, ls: LineState[]) => JSON.stringify([cid, ls])
  const saved = useRef(snapshot(clientId, lines))

  useEffect(() => { flashMessage = null }, [])

  useEffect(() => {
    setDirty(snapshot(clientId, lines) !== saved.current)
  }, [clientId, lines, setDirty])
  useEffect(() => () => setDirty(false), [setDirty])

  useEffect(() => {
    ;(async () => {
      try {
        setClients(await listClients())
        setServices(await listServices())
        setPct((await getSettings()).withholdingPct)
        if (initial) {
          const msgs: string[] = []
          for (const l of initial.lines) {
            if (l.sourceServiceId && l.sourcePriceAtAdd != null) {
              const s = await getService(l.sourceServiceId)
              if (s && s.price !== l.sourcePriceAtAdd) msgs.push(catalogPriceChanged(s.description, l.sourcePriceAtAdd, s.price))
            }
          }
          setNotices(msgs)
        }
      } catch (e) {
        setError(describeStorageError(e))
      }
    })()
  }, [initial])

  const client = useMemo(() => clients.find((c) => c.id === clientId) ?? null, [clients, clientId])
  const qLines = toLines(lines)
  const totals = calcTotals(qLines, client, pct)

  function updateLine(id: string, patch: Partial<LineState>) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function addFromCatalog(s: Service) {
    if (lines.some((l) => l.sourceServiceId === s.id)) {
      setError(M.serviceAlreadyInQuote)
      return
    }
    setError(null)
    setLines((ls) => [...ls, { id: newId(), description: s.description, qtyText: '1', priceText: String(s.price), sourceServiceId: s.id, sourcePriceAtAdd: s.price }])
    setShowCatalog(false)
  }

  async function startSaveToCatalog(l: LineState) {
    setSaveToCatalogFor({ lineId: l.id, code: await suggestCode(l.description) })
  }

  function currentDraft(): DraftQuote {
    return { id: quoteId, status: 'BORRADOR', clientId, lines: toLines(lines), createdAt, updatedAt: '' }
  }

  function showError(e: unknown) {
    if (e instanceof ValidationError && e.messages.length > 1) setErrorList(e.messages)
    setError(describeStorageError(e))
  }

  async function onSaveDraft() {
    setError(null); setErrorList([]); setSuccess(null)
    try {
      await saveDraft(currentDraft())
      saved.current = snapshot(clientId, lines)
      setDirty(false)
      persisted.current = true
      if (!initial) {
        flashMessage = M.draftSaved
        navigate(`/presupuestos/${quoteId}`, { replace: true })
      } else {
        setSuccess(M.draftSaved)
      }
    } catch (e) {
      showError(e)
    }
  }

  async function onSaveFinal() {
    setError(null); setErrorList([]); setSuccess(null)
    try {
      const profile = await getProfile()
      const errs = validateForCompletion({ lines: qLines }, client, profile)
      if (errs.length) {
        setErrorList(errs)
        setError(M.completeErrorsTitle)
        return
      }
      setConfirming(true)
    } catch (e) {
      showError(e)
    }
  }

  async function onConfirmFinal() {
    setConfirming(false)
    try {
      const q = await completeQuote(currentDraft())
      setDirty(false)
      setSuccess(quoteSaved(q.number))
      flashMessage = quoteSaved(q.number)
      onCompleted(q)
      if (!initial) navigate(`/presupuestos/${q.id}`, { replace: true })
    } catch (e) {
      if (e instanceof ValidationError) {
        setErrorList(e.messages)
        setError(M.completeErrorsTitle)
      } else {
        setError(M.completeStorageError)
      }
    }
  }

  async function onDelete() {
    setConfirmDelete(false)
    try {
      await deleteDraft(quoteId)
      setDirty(false)
      navigate('/presupuestos')
    } catch (e) {
      showError(e)
    }
  }

  return (
    <div>
      <div className="row-between">
        <h1>{initial ? 'Editar borrador' : 'Nuevo presupuesto'}</h1>
        <span className="badge badge-borrador">BORRADOR</span>
      </div>
      <p><GuardedLink href="/presupuestos">← Volver al listado</GuardedLink></p>
      {success && <div className="notice-success">{success}</div>}
      {notices.map((n, i) => <div key={i} className="notice-info">{n}</div>)}

      <div className="card">
        <h2>Cliente</h2>
        <div className="field">
          <label htmlFor="q-client">Cliente</label>
          <select id="q-client" value={clientId ?? ''} onChange={(e) => setClientId(e.target.value || null)}>
            <option value="">Sin cliente</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {client && (
          <div className="muted">
            {client.type === 'EMPRESA' ? 'Empresa' : 'Persona natural'}{client.taxId ? ` · ${client.taxId}` : ''}
          </div>
        )}
        {!showClientForm && <div className="actions"><button className="btn" onClick={() => setShowClientForm(true)}>Crear cliente nuevo</button></div>}
        {showClientForm && (
          <ClientForm
            onCancel={() => setShowClientForm(false)}
            onSaved={async (c) => {
              setClients(await listClients())
              setClientId(c.id)
              setShowClientForm(false)
            }}
          />
        )}
      </div>

      <div className="card">
        <h2>Líneas</h2>
        {lines.map((l, i) => {
          const q = textToQty(l.qtyText)
          const p = textToPrice(l.priceText)
          const calc = isLineCalculable({ quantityHundredths: q, unitPrice: p })
          const incomplete = !isLineValid({ id: l.id, description: l.description, quantityHundredths: q, unitPrice: p })
          return (
            <div className="line" key={l.id}>
              <div className="row-between">
                <strong>Línea {i + 1}</strong>
                {incomplete && <span className="badge badge-note">Incompleta</span>}
              </div>
              <div className="field"><label htmlFor={`d-${l.id}`}>Descripción</label>
                <input id={`d-${l.id}`} value={l.description} onChange={(e) => updateLine(l.id, { description: e.target.value })} /></div>
              <div className="line-grid">
                <div className="field"><label htmlFor={`q-${l.id}`}>Cantidad</label>
                  <input id={`q-${l.id}`} inputMode="decimal" value={l.qtyText} onChange={(e) => updateLine(l.id, { qtyText: e.target.value })} />
                  {Number.isNaN(q) && <span className="notice-error">{M.quantityNotNumber}</span>}</div>
                <div className="field"><label htmlFor={`p-${l.id}`}>Precio unitario</label>
                  <input id={`p-${l.id}`} inputMode="numeric" value={l.priceText} onChange={(e) => updateLine(l.id, { priceText: e.target.value })} />
                  {Number.isNaN(p) && <span className="notice-error">{M.priceNotNumber}</span>}</div>
              </div>
              {calc && <div>Importe: <strong>{formatCOP(lineAmount(q!, p!))}</strong></div>}
              <div className="actions">
                {!l.sourceServiceId && l.description.trim() && !saveToCatalogFor && (
                  <button className="btn" onClick={() => startSaveToCatalog(l)}>¿Guardarlo en el catálogo?</button>
                )}
                <button className="btn btn-danger" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}>Eliminar línea</button>
              </div>
              {saveToCatalogFor?.lineId === l.id && (
                <ServiceForm
                  initialCode={saveToCatalogFor.code}
                  initialDescription={l.description}
                  initialPrice={p != null && !Number.isNaN(p) ? p : undefined}
                  onCancel={() => setSaveToCatalogFor(null)}
                  onSaved={async (s) => {
                    updateLine(l.id, { sourceServiceId: s.id, sourcePriceAtAdd: s.price })
                    setServices(await listServices())
                    setSaveToCatalogFor(null)
                  }}
                />
              )}
            </div>
          )
        })}
        <div className="actions">
          <button className="btn" onClick={() => setShowCatalog((v) => !v)}>Agregar del catálogo</button>
          <button className="btn" onClick={() => setLines((ls) => [...ls, { id: newId(), description: '', qtyText: '1', priceText: '' }])}>Agregar concepto manual</button>
        </div>
        {showCatalog && (
          <div>
            {services.length === 0 && <p className="muted">Aún no tienes servicios en el catálogo.</p>}
            {services.map((s) => (
              <button key={s.id} className="btn btn-block" onClick={() => addFromCatalog(s)}>
                <span>{s.code} · {s.description}</span><span>{formatCOP(s.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card summary">
        <div><span>Base</span><span>{formatCOP(totals.base)}</span></div>
        <div><span>IVA (19 %)</span><span>{formatCOP(totals.iva)}</span></div>
        {totals.total === null ? (
          <div className="muted">{M.selectClientForTotal}</div>
        ) : (
          <>
            <div><span>Retención en la fuente ({client!.type === 'EMPRESA' ? pct : 0} %)</span><span>{formatCOP(totals.withholding ?? 0)}</span></div>
            <div className="total"><span>TOTAL</span><span>{formatCOP(totals.total)}</span></div>
          </>
        )}
      </div>

      {error && (
        <div className="notice-error">
          {error}
          {errorList.length > 0 && <ul>{errorList.map((m, i) => <li key={i}>{m}</li>)}</ul>}
        </div>
      )}

      <div className="actions">
        <button className="btn" onClick={onSaveDraft}>Guardar borrador</button>
        <button className="btn btn-primary" onClick={onSaveFinal}>Guardar presupuesto</button>
        {persisted.current && <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>Eliminar borrador</button>}
      </div>

      {confirming && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <div className="dialog">
            <p>{M.confirmComplete}</p>
            <div className="actions">
              <button className="btn" onClick={() => setConfirming(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={onConfirmFinal}>Continuar</button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true">
          <div className="dialog">
            <p>{M.confirmDeleteDraft}</p>
            <div className="actions">
              <button className="btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={onDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
