import { getDb } from './db'
import { ValidationError } from '../domain/errors'
import { M } from '../app/messages'
import { WITHHOLDING_OPTIONS, type Profile, type Settings } from '../domain/types'

export async function getProfile(): Promise<Profile | null> {
  const db = await getDb()
  return ((await db.get('profile', 'main')) as Profile | undefined) ?? null
}

export async function saveProfile(profile: Profile): Promise<void> {
  if (!profile.name?.trim()) throw new ValidationError(M.nameRequired)
  if (!profile.taxId?.trim()) throw new ValidationError(M.taxIdRequired)
  const db = await getDb()
  await db.put('profile', { ...profile, name: profile.name.trim(), taxId: profile.taxId.trim() }, 'main')
}

export async function getSettings(): Promise<Settings> {
  const db = await getDb()
  return ((await db.get('settings', 'main')) as Settings | undefined) ?? { withholdingPct: 11 }
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (!WITHHOLDING_OPTIONS.includes(settings.withholdingPct)) throw new ValidationError(M.withholdingInvalid)
  const db = await getDb()
  await db.put('settings', { withholdingPct: settings.withholdingPct }, 'main')
}
