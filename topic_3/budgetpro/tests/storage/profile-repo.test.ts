import { describe, it, expect, beforeEach } from 'vitest'
import { getProfile, saveProfile, getSettings, saveSettings } from '../../src/storage/profile-repo'
import { freshDb } from './helpers'

beforeEach(freshDb)

describe('profile-repo', () => {
  it('guarda y lee el perfil', async () => {
    expect(await getProfile()).toBeNull()
    await saveProfile({ name: 'Ana', taxId: '123', email: 'a@b.co' })
    expect(await getProfile()).toMatchObject({ name: 'Ana', taxId: '123', email: 'a@b.co' })
  })
  it('rechaza sin nombre o NIT', async () => {
    await expect(saveProfile({ name: ' ', taxId: '1' })).rejects.toThrow('El nombre o razón social es obligatorio.')
    await expect(saveProfile({ name: 'A', taxId: '' })).rejects.toThrow('El NIT/CC es obligatorio.')
  })
  it('settings por defecto 11 y solo 4/6/10/11', async () => {
    expect((await getSettings()).withholdingPct).toBe(11)
    await saveSettings({ withholdingPct: 4 })
    expect((await getSettings()).withholdingPct).toBe(4)
    await expect(saveSettings({ withholdingPct: 5 as never })).rejects.toThrow()
  })
})
