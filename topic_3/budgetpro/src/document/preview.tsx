import type { QuoteDocument } from './quote-document'

/** Filas de texto que muestra la vista previa (la prueba las compara con las del PDF). */
export function renderPreviewRows(doc: QuoteDocument): string[][] {
  return doc.rows.map((r) => [r.description, r.quantity, r.unitPrice, r.amount])
}

function ContactLines({ p }: { p: { taxId?: string; email?: string; phone?: string; address?: string } }) {
  return (
    <>
      {p.taxId && <div>NIT/CC: {p.taxId}</div>}
      {p.email && <div>{p.email}</div>}
      {p.phone && <div>{p.phone}</div>}
      {p.address && <div>{p.address}</div>}
    </>
  )
}

export function QuotePreviewDocument({ doc }: { doc: QuoteDocument }) {
  const rows = renderPreviewRows(doc)
  return (
    <div className="paper">
      <div className="paper-header">
        <div>
          <h1>{doc.title}</h1>
          <div>Número: {doc.number}</div>
          <div>Fecha de emisión: {doc.issueDate}</div>
          <div>Fecha de vencimiento: {doc.dueDate}</div>
        </div>
        {doc.issuer.logo && <img className="paper-logo" src={doc.issuer.logo} alt="Logo" />}
      </div>
      <div className="paper-blocks">
        <div>
          <strong>Profesional</strong>
          <div>{doc.issuer.name}</div>
          <ContactLines p={doc.issuer} />
        </div>
        <div>
          <strong>Cliente</strong>
          <div>{doc.client.name}</div>
          <div>{doc.client.typeLabel}</div>
          <ContactLines p={doc.client} />
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th className="num">Cantidad</th>
            <th className="num">Precio unitario</th>
            <th className="num">Importe</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td data-label="Descripción">{r[0]}</td>
              <td className="num" data-label="Cantidad">{r[1]}</td>
              <td className="num" data-label="Precio unitario">{r[2]}</td>
              <td className="num" data-label="Importe">{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="summary">
        <div><span>Base</span><span>{doc.summary.base}</span></div>
        <div><span>{doc.summary.ivaLabel}</span><span>{doc.summary.iva}</span></div>
        {doc.summary.withholding && (
          <div><span>{doc.summary.withholding.label}</span><span>{doc.summary.withholding.value}</span></div>
        )}
        <div className="total"><span>TOTAL</span><span>{doc.summary.total}</span></div>
      </div>
    </div>
  )
}
