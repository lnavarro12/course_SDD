import { getDb } from './db'
import { ValidationError } from '../domain/errors'
import { M } from '../app/messages'
import type { Service } from '../domain/types'

export async function listServices(): Promise<Service[]> {
  const db = await getDb()
  const all = (await db.getAll('services')) as Service[]
  return all.sort((a, b) => a.code.localeCompare(b.code, 'es'))
}

export async function getService(id: string): Promise<Service | null> {
  const db = await getDb()
  return ((await db.get('services', id)) as Service | undefined) ?? null
}

export async function saveService(input: Omit<Service, 'codeKey'> & { codeKey?: string }): Promise<void> {
  const code = input.code?.trim() ?? ''
  if (!code) throw new ValidationError(M.serviceCodeRequired)
  if (!input.description?.trim()) throw new ValidationError(M.serviceDescriptionRequired)
  if (typeof input.price !== 'number' || !Number.isInteger(input.price) || input.price < 0)
    throw new ValidationError(M.servicePriceInvalid)
  const codeKey = code.toLowerCase()
  const db = await getDb()
  const existing = (await db.getFromIndex('services', 'codeKey', codeKey)) as Service | undefined
  if (existing && existing.id !== input.id) throw new ValidationError(M.serviceCodeDuplicate)
  await db.put('services', { id: input.id, code, codeKey, description: input.description.trim(), price: input.price })
}

export async function deleteService(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('services', id)
}

export async function suggestCode(description: string): Promise<string> {
  const initials =
    description
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .split(/\s+/)
      .filter((w) => /^[A-Za-z]/.test(w))
      .map((w) => w[0].toUpperCase())
      .join('')
      .slice(0, 4) || 'SRV'
  const existing = new Set((await listServices()).map((s) => s.codeKey))
  let n = 1
  for (;;) {
    const code = `${initials}-${String(n).padStart(2, '0')}`
    if (!existing.has(code.toLowerCase())) return code
    n++
  }
}
