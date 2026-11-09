import { getDb } from './db'
import { ValidationError } from '../domain/errors'
import { M } from '../app/messages'
import type { Client } from '../domain/types'

export async function listClients(): Promise<Client[]> {
  const db = await getDb()
  const all = (await db.getAll('clients')) as Client[]
  return all.sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export async function getClient(id: string): Promise<Client | null> {
  const db = await getDb()
  return ((await db.get('clients', id)) as Client | undefined) ?? null
}

export async function saveClient(client: Client): Promise<void> {
  if (!client.name?.trim()) throw new ValidationError(M.clientNameRequired)
  if (!client.type) throw new ValidationError(M.clientTypeRequired)
  if (client.type === 'EMPRESA' && !client.taxId?.trim()) throw new ValidationError(M.taxIdRequiredCompany)
  const db = await getDb()
  await db.put('clients', { ...client, name: client.name.trim(), taxId: client.taxId?.trim() || undefined })
}

export async function findByTaxId(taxId: string, excludeId?: string): Promise<Client | null> {
  const t = taxId.trim()
  if (!t) return null
  const all = await listClients()
  return all.find((c) => c.id !== excludeId && (c.taxId ?? '').trim() === t) ?? null
}

export async function deleteClient(id: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['clients', 'quotes'], 'readwrite')
  const quotes = tx.objectStore('quotes')
  for (const q of await quotes.getAll()) {
    if (q.status === 'BORRADOR' && q.clientId === id) await quotes.put({ ...q, clientId: null })
  }
  await tx.objectStore('clients').delete(id)
  await tx.done
}
