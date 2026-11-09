import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { QuoteDocument } from './quote-document'
import { renderPreviewRows } from './preview'

export const PDF_ERROR_MESSAGE =
  'No se pudo generar el PDF. Inténtalo de nuevo; si continúa, cierra y vuelve a abrir la aplicación.'

function lines(p: { taxId?: string; email?: string; phone?: string; address?: string }): Content[] {
  return [
    p.taxId ? `NIT/CC: ${p.taxId}` : '',
    p.email ?? '',
    p.phone ?? '',
    p.address ?? '',
  ].filter(Boolean) as Content[]
}

export interface PdfTheme {
  primary: string
  text: string
  muted: string
  line: string
  fill: string
}

export function buildPdfDefinition(doc: QuoteDocument, theme: PdfTheme): TDocumentDefinitions {
  const rows = renderPreviewRows(doc)
  const muted = (t: string, extra: object = {}) => ({ text: t, color: theme.muted, ...extra })
  const summaryRows: Content[][] = [
    [muted('Base'), muted(doc.summary.base, { alignment: 'right' })],
    [muted(doc.summary.ivaLabel), muted(doc.summary.iva, { alignment: 'right' })],
  ]
  if (doc.summary.withholding)
    summaryRows.push([
      muted(doc.summary.withholding.label),
      muted(doc.summary.withholding.value, { alignment: 'right' }),
    ])
  summaryRows.push([
    { text: 'TOTAL', bold: true, fontSize: 12, color: theme.primary, fillColor: theme.fill, margin: [0, 3, 0, 3] },
    { text: doc.summary.total, alignment: 'right', bold: true, fontSize: 12, color: theme.primary, fillColor: theme.fill, margin: [0, 3, 0, 3] },
  ])

  const header: Content = {
    columns: [
      {
        width: '*',
        stack: [
          { text: doc.title, fontSize: 22, bold: true, color: theme.primary, margin: [0, 0, 0, 4] },
          `Número: ${doc.number}`,
          `Fecha de emisión: ${doc.issueDate}`,
          `Fecha de vencimiento: ${doc.dueDate}`,
        ],
      },
      ...(doc.issuer.logo ? [{ width: 140, image: doc.issuer.logo, fit: [140, 70] as [number, number], alignment: 'right' as const }] : []),
    ],
    margin: [0, 0, 0, 8],
  }
  const accent: Content = {
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: theme.primary }],
    margin: [0, 0, 0, 12],
  }
  const th = (text: string, right = false): Content => ({
    text, bold: true, color: theme.primary, fillColor: theme.fill, margin: [0, 3, 0, 3],
    ...(right ? { alignment: 'right' as const } : {}),
  })

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { font: 'Roboto', fontSize: 10, color: theme.text },
    content: [
      header,
      accent,
      {
        columns: [
          { width: '*', stack: [{ text: 'Profesional', bold: true, color: theme.primary }, doc.issuer.name, ...lines(doc.issuer)] },
          {
            width: '*',
            stack: [{ text: 'Cliente', bold: true, color: theme.primary }, doc.client.name, doc.client.typeLabel, ...lines(doc.client)],
          },
        ],
        columnGap: 16,
        margin: [0, 0, 0, 16],
      },
      {
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: ['*', 60, 90, 90],
          body: [
            [th('Descripción'), th('Cantidad', true), th('Precio unitario', true), th('Importe', true)],
            ...rows.map((r): Content[] => [
              { text: r[0], margin: [0, 2, 0, 2] },
              { text: r[1], alignment: 'right', margin: [0, 2, 0, 2] },
              { text: r[2], alignment: 'right', margin: [0, 2, 0, 2] },
              { text: r[3], alignment: 'right', margin: [0, 2, 0, 2] },
            ]),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => theme.line,
        },
      },
      {
        margin: [0, 16, 0, 0],
        columns: [
          { width: '*', text: '' },
          { width: 240, table: { widths: ['*', 'auto'], body: summaryRows }, layout: 'noBorders' },
        ],
      },
    ],
  }
}

function readPdfTheme(): PdfTheme {
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return {
    primary: v('--pdf-primary'),
    text: v('--pdf-text'),
    muted: v('--pdf-muted'),
    line: v('--pdf-line'),
    fill: v('--pdf-fill'),
  }
}

/** Carga pdfmake y sus fuentes solo al descargar. No escribe nada en almacenamiento. */
export async function downloadPdf(doc: QuoteDocument): Promise<void> {
  try {
    const [pdfMakeMod, vfsMod] = await Promise.all([
      import('pdfmake/build/pdfmake'),
      import('pdfmake/build/vfs_fonts'),
    ])
    const pdfMake: any = (pdfMakeMod as any).default ?? pdfMakeMod
    const vfs: any = (vfsMod as any).default ?? vfsMod
    pdfMake.addVirtualFileSystem(vfs)
    await pdfMake.createPdf(buildPdfDefinition(doc, readPdfTheme())).download(doc.fileName)
  } catch {
    throw new Error(PDF_ERROR_MESSAGE)
  }
}
