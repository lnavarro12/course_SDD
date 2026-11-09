import { describe, it, expect, beforeEach } from 'vitest'
import { saveService, listServices, suggestCode } from '../../src/storage/services-repo'
import { freshDb } from './helpers'

beforeEach(freshDb)
const S = (o = {}) => ({ id: 's1', code: 'LOGO-01', description: 'Logo', price: 100, ...o })

describe('services-repo', () => {
  it('código único sin distinguir mayúsculas', async () => {
    await saveService(S())
    await expect(saveService(S({ id: 's2', code: 'logo-01' }))).rejects.toThrow('Ya existe un servicio con ese código.')
    await expect(saveService(S({ id: 's3', code: ' Logo-01 ' }))).rejects.toThrow('Ya existe un servicio con ese código.')
    await saveService(S({ description: 'Logo nuevo' })) // editar el mismo
    expect((await listServices())[0].description).toBe('Logo nuevo')
  })
  it('validaciones de campos y precio', async () => {
    await expect(saveService(S({ description: '' }))).rejects.toThrow(/descripción/)
    await expect(saveService(S({ price: -1 }))).rejects.toThrow(/precio/)
    await expect(saveService(S({ price: 1.5 }))).rejects.toThrow(/precio/)
    await saveService(S({ price: 0 }))
  })
  it('suggestCode genera uno inexistente', async () => {
    await saveService(S({ code: 'DL-01' }))
    expect(await suggestCode('Diseño de logo')).toBe('DDL-01')
    await saveService(S({ id: 's9', code: 'DDL-01' }))
    expect(await suggestCode('Diseño de logo')).toBe('DDL-02')
  })
})
