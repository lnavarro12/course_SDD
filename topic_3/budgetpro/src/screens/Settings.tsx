import { useEffect, useState } from 'react'
import { getProfile, getSettings, saveProfile, saveSettings } from '../storage/profile-repo'
import { resizeLogo } from '../app/logo-resize'
import { M, describeStorageError } from '../app/messages'
import { WITHHOLDING_OPTIONS, type WithholdingPct } from '../domain/types'

export default function Settings() {
  const [name, setName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [logo, setLogo] = useState<string | undefined>()
  const [pct, setPct] = useState<WithholdingPct>(11)
  const [error, setError] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const p = await getProfile()
        const s = await getSettings()
        if (p) {
          setName(p.name)
          setTaxId(p.taxId)
          setEmail(p.email ?? '')
          setPhone(p.phone ?? '')
          setAddress(p.address ?? '')
          setLogo(typeof p.logo === 'string' ? p.logo : undefined)
        }
        setPct(s.withholdingPct)
      } catch (e) {
        setError(describeStorageError(e))
      }
      setLoaded(true)
    })()
  }, [])

  async function onLogo(file: File | undefined) {
    if (!file) return
    setLogoError(null)
    try {
      setLogo(await resizeLogo(file))
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : M.logoInvalid)
    }
  }

  async function onSave() {
    setError(null)
    setOk(false)
    try {
      await saveProfile({ name, taxId, email, phone, address, logo })
      await saveSettings({ withholdingPct: pct })
      setOk(true)
    } catch (e) {
      setError(describeStorageError(e))
    }
  }

  if (!loaded) return <p className="muted">Cargando…</p>

  return (
    <div>
      <h1>Perfil</h1>
      <div className="card">
        <h2>Datos profesionales</h2>
        <div className="field"><label htmlFor="s-name">Nombre o razón social *</label>
          <input id="s-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="field"><label htmlFor="s-tax">NIT/CC *</label>
          <input id="s-tax" value={taxId} onChange={(e) => setTaxId(e.target.value)} /></div>
        <div className="field"><label htmlFor="s-email">Correo</label>
          <input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="s-phone">Teléfono</label>
          <input id="s-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="field"><label htmlFor="s-addr">Dirección</label>
          <input id="s-addr" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        <div className="field"><label htmlFor="s-logo">Logo (PNG o JPG, hasta 2 MB)</label>
          <input id="s-logo" type="file" accept="image/png,image/jpeg" onChange={(e) => onLogo(e.target.files?.[0])} />
          {logoError && <div className="notice-error">{logoError}</div>}
          {logo && <img className="logo-preview" src={logo} alt="Vista previa del logo" />}
        </div>
      </div>
      <div className="card">
        <h2>Configuración fiscal</h2>
        <div className="field"><label>IVA</label><div>19 %</div></div>
        <div className="field"><label htmlFor="s-pct">Retención en la fuente (empresas)</label>
          <select id="s-pct" value={pct} onChange={(e) => setPct(Number(e.target.value) as WithholdingPct)}>
            {WITHHOLDING_OPTIONS.map((o) => <option key={o} value={o}>{o} %</option>)}
          </select></div>
      </div>
      {error && <div className="notice-error">{error}</div>}
      {ok && <div className="notice-success">Perfil guardado.</div>}
      <div className="actions"><button className="btn btn-primary" onClick={onSave}>Guardar</button></div>
    </div>
  )
}
