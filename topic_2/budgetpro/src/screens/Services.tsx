import { useEffect, useState } from 'react'
import { deleteService, listServices, saveService } from '../storage/services-repo'
import { newId } from '../storage/db'
import { describeStorageError, M } from '../app/messages'
import { formatCOP, parsePrice } from '../domain/money'
import type { Service } from '../domain/types'

export function ServiceForm({
  initial,
  initialDescription,
  initialCode,
  initialPrice,
  onSaved,
  onCancel,
}: {
  initial?: Service
  initialDescription?: string
  initialCode?: string
  initialPrice?: number
  onSaved: (s: Service) => void
  onCancel: () => void
}) {
  const [code, setCode] = useState(initial?.code ?? initialCode ?? '')
  const [description, setDescription] = useState(initial?.description ?? initialDescription ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : initialPrice != null ? String(initialPrice) : '')
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setError(null)
    const p = parsePrice(price)
    if (p === null) return setError(M.servicePriceInvalid)
    const svc: Service = { id: initial?.id ?? newId(), code, codeKey: code.trim().toLowerCase(), description, price: p }
    try {
      await saveService(svc)
      onSaved({ ...svc, code: code.trim(), description: description.trim() })
    } catch (e) {
      setError(describeStorageError(e))
    }
  }

  return (
    <div className="card">
      <div className="field"><label htmlFor="sv-code">Código *</label>
        <input id="sv-code" value={code} onChange={(e) => setCode(e.target.value)} /></div>
      <div className="field"><label htmlFor="sv-desc">Descripción *</label>
        <input id="sv-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="field"><label htmlFor="sv-price">Precio (pesos) *</label>
        <input id="sv-price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
      {error && <div className="notice-error">{error}</div>}
      <div className="actions">
        <button className="btn btn-primary" onClick={onSave}>Guardar servicio</button>
        <button className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [editing, setEditing] = useState<Service | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      setServices(await listServices())
    } catch (e) {
      setError(describeStorageError(e))
    }
  }
  useEffect(() => { void refresh() }, [])

  async function onDelete(s: Service) {
    if (!window.confirm(`¿Eliminar el servicio ${s.code}?`)) return
    try {
      await deleteService(s.id)
      await refresh()
    } catch (e) {
      setError(describeStorageError(e))
    }
  }

  return (
    <div>
      <div className="row-between">
        <h1>Catálogo</h1>
        {!editing && <button className="btn btn-primary" onClick={() => setEditing('new')}>Nuevo servicio</button>}
      </div>
      {error && <div className="notice-error">{error}</div>}
      {editing && (
        <ServiceForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); void refresh() }}
        />
      )}
      {!editing && services.length === 0 && <p className="muted">Aún no tienes servicios.</p>}
      {!editing && services.map((s) => (
        <div className="card" key={s.id}>
          <div className="row-between"><strong>{s.code}</strong><span>{formatCOP(s.price)}</span></div>
          <div>{s.description}</div>
          <div className="actions">
            <button className="btn" onClick={() => setEditing(s)}>Editar</button>
            <button className="btn btn-danger" onClick={() => onDelete(s)}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
