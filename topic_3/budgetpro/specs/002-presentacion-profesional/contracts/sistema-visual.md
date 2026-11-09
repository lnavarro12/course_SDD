# Contrato del sistema visual

Todo valor visual vive como variable CSS en el bloque `:root` de [src/styles.css](../../../src/styles.css). Ninguna regla de componente ni pantalla usa colores, tamaños de letra ni separaciones literales: solo variables. Los valores concretos se fijan al implementar dentro de estos límites.

## Variables

| Grupo | Variables | Reglas |
|---|---|---|
| Color de marca | `--c-primary` (`#1f4e79`, se conserva), `--c-primary-dark`, `--c-primary-soft` | El principal coincide con `theme-color` y el manifiesto |
| Neutros | `--c-bg`, `--c-card`, `--c-text`, `--c-muted`, `--c-border` | Texto normal ≥ 4,5:1 sobre su fondo |
| Funcionales | `--c-success`, `--c-warning`, `--c-danger` y su versión suave de fondo | Solo para mensajes y estados |
| Tipografía | `--font-base`, `--fs-title`, `--fs-subtitle`, `--fs-body`, `--fs-small`, `--fw-regular`, `--fw-bold`, `--lh-body` | `--font-base` es la pila del sistema |
| Espaciado | `--sp-1` a `--sp-5` (escala de 4 px: 4, 8, 12, 16, 24) | Todo margen, separación y relleno usa la escala |
| Forma | `--radius`, `--tap-min` (44 px) | `--tap-min` es el alto mínimo de controles |
| PDF | `--pdf-primary`, `--pdf-text`, `--pdf-muted`, `--pdf-line`, `--pdf-fill` | Los lee `downloadPdf`; referencian a las anteriores cuando es posible |

## Jerarquía

| Nivel | Uso |
|---|---|
| Título de pantalla | `--fs-title`, negrita, color de texto |
| Subtítulo de sección | `--fs-subtitle`, negrita |
| Texto | `--fs-body` |
| Nota o ayuda | `--fs-small`, `--c-muted` |
| Tablas | Cabecera con fondo suave y texto en negrita; importes alineados a la derecha |
| Formularios | Etiqueta pequeña sobre campo de alto `--tap-min` |
| Totales | Bloque con borde superior marcado; fila TOTAL en `--fs-subtitle` y negrita |

## Estados de presupuesto

| Estado | Etiqueta | Aspecto |
|---|---|---|
| BORRADOR | texto "BORRADOR" | Fondo suave de aviso, borde **punteado** |
| COMPLETO | texto "COMPLETO" | Fondo de éxito **relleno** |

Se distinguen por texto y forma del borde, no solo por color. Se usan en el listado, el detalle y el inicio.

## Mensajes

`notice-error`, `notice-info`, `notice-success` conservan sus nombres de clase; usan color funcional + borde + texto, distinguibles entre sí.

## PDF (plantilla)

- Tamaño y márgenes de 001 (A4, 40 pt); fuente Roboto de `pdfmake`.
- Título **PRESUPUESTO** en `--pdf-primary` con línea de acento; datos del presupuesto a su lado.
- Bloques Profesional y Cliente con rótulo en color de marca.
- Tabla: cabecera rellena con `--pdf-fill`, filas separadas por línea suave `--pdf-line`, importes a la derecha.
- Totales: Base, IVA y retención en gris; fila **TOTAL** resaltada. Sin contenido nuevo: mismos textos, importes, formatos y nombre de archivo que el [contrato del documento de 001](../../001-presupuestos-pdf/contracts/documento-presupuesto.md).
