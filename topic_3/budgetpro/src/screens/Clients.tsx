import { useEffect, useState } from 'react'
import { deleteClient, findByTaxId, listClients, saveClient } from '../storage/clients-repo'
import { newId } from '../storage/db'
import { M, describeStorageError } from '../app/messages'
import type { Client, ClientType } from '../domain/types'

export function ClientForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Client
  onSaved: (c: Client) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<ClientType | ''>(initial?.type ?? '')
  const [taxId, setTaxId] = useState(initial?.taxId ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [error, setError] = useState<string | null>(null)
  const [confirmDup, setConfirmDup] = useState<Client | null>(null)

  async function persist(client: Client) {
    try {
      await saveClient(client)
      onSaved(client)
    } catch (e) {
      setError(describeStorageError(e))
    }
  }

  async function onSave() {
    setError(null)
    const client: Client = {
      id: initial?.id ?? newId(),
      name,
      type: type as ClientType,
      taxId: taxId.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    }
    // Validación previa para no preguntar por duplicado si el formulario es inválido
    if (!client.name.trim()) return setError(M.clientNameRequired)
    if (!client.type) return setError(M.clientTypeRequired)
    if (client.type === 'EMPRESA' && !client.taxId) return setError(M.taxIdRequiredCompany)
    if (client.taxId) {
      try {
        const dup = await findByTaxId(client.taxId, client.id)
        if (dup) return setConfirmDup(client)
      } catch (e) {
        return setError(describeStorageError(e))
      }
    }
    await persist(client)
  }

  return (
    <div className="card">
      <div className="field"><label htmlFor="c-name">Nombre o razón social *</label>
        <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="c-type">Tipo de cliente *</label>
        <select id="c-type" value={type} onChange={(e) => setType(e.target.value as ClientType | '')}>
          <option value="">Selecciona…</option>
          <option value="PERSONA_NATURAL">Persona natural</option>
          <option value="EMPRESA">Empresa</option>
        </select></div>
      <div className="field"><label htmlFor="c-tax">NIT/CC{type === 'EMPRESA' ? ' *' : ''}</label>
        <input id="c-tax" value={taxId} onChange={(e) => setTaxId(e.target.value)} /></div>
      <div className="field"><label htmlFor="c-email">Correo</label>
        <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label htmlFor="c-phone">Teléfono</label>
        <input id="c-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="field"><label htmlFor="c-addr">Dirección</label>
        <input id="c-addr" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
      {error && <div className="notice-error">{error}</div>}
      {confirmDup && (
        <div className="notice-info">
          <p>{M.clientTaxIdDuplicate}</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => { const c = confirmDup; setConfirmDup(null); void persist(c) }}>Guardar</button>
            <button className="btn" onClick={() => setConfirmDup(null)}>Cancelar</button>
          </div>
        </div>
      )}
      <div className="actions">
        <button className="btn btn-primary" onClick={onSave}>Guardar cliente</button>
        <button className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [editing, setEditing] = useState<Client | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      setClients(await listClients())
    } catch (e) {
      setError(describeStorageError(e))
    }
  }
  useEffect(() => { void refresh() }, [])

  async function onDelete(c: Client) {
    if (!window.confirm(`¿Eliminar a ${c.name}?`)) return
    try {
      await deleteClient(c.id)
      await refresh()
    } catch (e) {
      setError(describeStorageError(e))
    }
  }

  return (
    <div>
      <div className="row-between">
        <h1>Clientes</h1>
        {!editing && <button className="btn btn-primary" onClick={() => setEditing('new')}>Nuevo cliente</button>}
      </div>
      {error && <div className="notice-error">{error}</div>}
      {editing && (
        <ClientForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); void refresh() }}
        />
      )}
      {!editing && clients.length === 0 && <p className="muted">Aún no tienes clientes.</p>}
      {!editing && clients.map((c) => (
        <div className="card" key={c.id}>
          <div className="title"><strong>{c.name}</strong></div>
          <div className="muted">{c.type === 'EMPRESA' ? 'Empresa' : 'Persona natural'}{c.taxId ? ` · ${c.taxId}` : ''}</div>
          <div className="actions">
            <button className="btn" onClick={() => setEditing(c)}>Editar</button>
            <button className="btn btn-danger" onClick={() => onDelete(c)}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
