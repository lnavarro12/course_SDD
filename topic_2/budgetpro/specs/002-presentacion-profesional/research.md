# Investigación y decisiones: Inicio, navegación y rediseño visual

Estado actual verificado en el código: ya existe una barra de navegación común en `App.tsx` (Presupuestos, Clientes, Servicios, Configuración) y `styles.css` tiene 84 líneas con algunas variables (`--c-*`, `--sp`) y colores sueltos (`#fff`, `#fff3cd`, etc.) repartidos por las reglas.

## Decisiones

### 1. Sistema visual en variables CSS dentro de `styles.css`
- **Decisión**: un bloque `:root` con tres grupos de variables (color, tipografía, espaciado/forma) y reglas de componentes que **solo** usan variables; ningún color literal fuera del bloque `:root`.
- **Razón**: SC-009 (cambio de color en un solo lugar) y FR-010/FR-011. Es lo que el usuario pidió.
- **Alternativas**: archivo de tokens TypeScript (dos fuentes de verdad); librería de UI o Tailwind (dependencia nueva, contra Principio I y la instrucción).

### 2. Tipografía: pila del sistema en la app, Roboto incluido en el PDF
- **Decisión**: la app usa `system-ui` (ya en uso) con escala definida (títulos, subtítulos, texto, nota). El PDF mantiene Roboto, que `pdfmake` ya trae.
- **Razón**: no descargar fuentes (funciona sin conexión, Principio V, sin dependencias nuevas). La coherencia entre app y PDF se logra con **paleta, jerarquía y espaciado**, no con la misma familia tipográfica.
- **Alternativas**: empaquetar una fuente web (peso extra y archivos nuevos); fuente web remota (rompe el uso sin conexión).

### 3. Paleta limitada y color principal conservado
- **Decisión**: azul institucional `#1f4e79` como principal (se conserva), grises neutros para fondo, bordes y texto, y tres tonos funcionales (éxito, aviso, error) para mensajes y estados. Total ≈ 10 variables de color.
- **Razón**: `index.html` (`theme-color`) y `vite.config.ts` (manifiesto) repiten ese hex y no pueden leer variables CSS; conservarlo evita duplicar un cambio y no obliga a tocar esos archivos.
- **Alternativas**: cambiar el principal (obligaría a editar tres lugares).

### 4. Estados distinguibles sin depender solo del color
- **Decisión**: BORRADOR = etiqueta con borde punteado y fondo claro de aviso; COMPLETO = etiqueta rellena de color de éxito. Ambas llevan siempre su texto.
- **Razón**: FR-013 y accesibilidad; cubre solo los dos estados reales (clarificación del 2026-11-09).
- **Alternativas**: iconos (suman recursos); cinco estados (fuera de alcance).

### 5. Navegación común y direcciones
- **Decisión**: la barra de `App.tsx` pasa a leer una lista única (`sections.ts`) con Inicio, Presupuestos, Clientes, Catálogo, Perfil. La raíz `#/` muestra Home; el listado pasa a `#/presupuestos`. Las rutas `#/clientes`, `#/servicios`, `#/configuracion`, `#/presupuestos/nuevo`, `#/presupuestos/:id` y `#/presupuestos/:id/vista` **no cambian**.
- **Razón**: clarificación de FR-007/FR-008 y SC-002. Mantener `#/servicios` y `#/configuracion` evita romper enlaces; solo cambia el texto visible (clarificación 1).
- **Alternativas**: renombrar las rutas (rompe enlaces sin necesidad); barra inferior solo móvil (más piezas).
- **Detalle de la barra en 360 px**: las 5 secciones visibles a la vez con reparto equitativo del ancho y salto a una segunda fila si no caben (clarificación 2026-11-09); sin menú plegable ni desplazamiento interno. Se comprueba en el quickstart. Los enlaces siguen usando `GuardedLink` (FR-006).

### 6. Resumen de actividad del inicio
- **Decisión**: `Home` llama a `listQuotes()` y cuenta por `status` con una función pura `countByStatus` (BORRADOR, COMPLETO, total). Sin importes ni gráficos.
- **Razón**: FR-003; reutiliza la lectura existente, sin tocar `storage/`. La función pura se prueba sin pantalla.
- **Alternativas**: índice nuevo en IndexedDB (cambia el esquema, prohibido); mostrar totales en pesos (fuera de alcance).

### 7. Plantilla del PDF
- **Decisión**: mismo contenido y mismo modelo (`quote-document.ts`); cambia solo el estilo en `pdf.ts`: encabezado con título en el color principal y una línea de acento, cabecera de tabla rellena, filas con separadores suaves, bloque de totales con el TOTAL resaltado. `buildPdfDefinition(doc, theme)` recibe los colores; `downloadPdf` los lee de las variables CSS con `getComputedStyle`.
- **Razón**: FR-017 a FR-019 y SC-007. Recibir el tema como parámetro mantiene la función pura y probable en Vitest (entorno sin DOM).
- **Alternativas**: constantes de color duplicadas en TypeScript (dos fuentes); pie de página con numeración (contenido nuevo, descartado por FR-018).

### 8. Texto "Configuración" en un mensaje de dominio
- **Decisión**: cambiar el literal de `quote-rules.ts` a "…en Perfil." y los dos tests que lo comparan.
- **Razón**: FR-002 exige un nombre único. Es un cambio de texto, no de lógica (FR-020). Se declara como excepción en Complexity Tracking.

## Trazabilidad FR → cambio

| Requisito | Dónde se resuelve |
|---|---|
| FR-001, FR-002, FR-003, FR-004 | `Home.tsx`, `sections.ts`, `App.tsx` |
| FR-005, FR-006 | `App.tsx` (barra) y `GuardedLink` existente |
| FR-007, FR-008 | `App.tsx` (rutas), enlaces internos de pantallas |
| FR-009 a FR-012, FR-014, FR-015, FR-016 | `styles.css` y clases en las pantallas |
| FR-013 | etiquetas de estado en `QuotesList`, `QuoteEditor`, `Home` |
| FR-017 a FR-019 | `pdf.ts`, `preview.tsx` |
| FR-020 | límites declarados: sin cambios en `domain/` ni `storage/` salvo el texto del punto 8 |

No quedan NEEDS CLARIFICATION.
