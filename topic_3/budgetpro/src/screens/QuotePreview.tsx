import { useEffect, useState } from 'react'
import { Link, useParams } from 'wouter'
import { getQuote } from '../storage/quotes-repo'
import { buildQuoteDocument } from '../document/quote-document'
import { QuotePreviewDocument } from '../document/preview'
import { downloadPdf } from '../document/pdf'
import { M, describeStorageError } from '../app/messages'
import type { Quote } from '../domain/types'

export default function QuotePreview() {
  const { id } = useParams<{ id: string }>()
  const [quote, setQuote] = useState<Quote | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getQuote(id).then(setQuote).catch((e) => setError(describeStorageError(e)))
  }, [id])

  if (error && quote === undefined) return <div className="notice-error">{error}</div>
  if (quote === undefined) return <p className="muted">Cargando…</p>
  if (quote === null) return <div className="notice-info">{M.quoteNotAvailable}</div>
  if (quote.status !== 'COMPLETO')
    return (
      <div>
        <div className="notice-info">{M.previewBlocked}</div>
        <Link className="btn" href={`/presupuestos/${quote.id}`}>Volver al borrador</Link>
      </div>
    )

  const doc = buildQuoteDocument(quote)
  async function onDownload() {
    setError(null)
    setBusy(true)
    try {
      await downloadPdf(doc)
    } catch (e) {
      setError(e instanceof Error ? e.message : M.pdfFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="actions">
        <Link className="btn" href={`/presupuestos/${quote.id}`}>Volver</Link>
        <button className="btn btn-primary" onClick={onDownload} disabled={busy}>{busy ? 'Generando…' : 'Descargar PDF'}</button>
      </div>
      {error && <div className="notice-error">{error}</div>}
      <QuotePreviewDocument doc={doc} />
    </div>
  )
}
