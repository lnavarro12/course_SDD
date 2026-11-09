# Tasks: PresupuestosPro — Página de inicio, navegación común y rediseño visual

**Input**: Documentos de diseño en `/specs/002-presentacion-profesional/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/pantallas-y-rutas.md, contracts/sistema-visual.md, quickstart.md

**Tests**: No se pidió TDD. Solo se incluyen los ajustes de pruebas existentes y la prueba nueva del conteo que el plan declara (T005, T006, T017).

**Organization**: Agrupadas por historia de usuario. Todas las rutas son relativas a la raíz del repositorio. Solo cambia la presentación: `src/domain/` y `src/storage/` no cambian de lógica (FR-020).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1–US4)

---

## Phase 1: Setup

**Purpose**: Línea base antes de tocar nada

- [X] T001 Ejecutar `npm test` y `npm run build` en la raíz y confirmar que pasan antes de cambios (línea base de FR-020/SC-008); anotar cualquier fallo previo sin corregirlo

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Sistema visual único y lista compartida de secciones; bloquea todas las historias

**⚠️ CRITICAL**: Ninguna historia empieza hasta terminar esta fase

- [X] T002 Reescribir `src/styles.css` según `contracts/sistema-visual.md`: un único bloque `:root` con variables de color (`--c-primary: #1f4e79`, `--c-primary-dark`, `--c-primary-soft`, `--c-bg`, `--c-card`, `--c-text`, `--c-muted`, `--c-border`, `--c-success`, `--c-warning`, `--c-danger` y sus versiones suaves de fondo), tipografía (`--font-base` pila del sistema, `--fs-title`, `--fs-subtitle`, `--fs-body`, `--fs-small`, `--fw-regular`, `--fw-bold`, `--lh-body`), espaciado (`--sp-1`…`--sp-5` = 4, 8, 12, 16, 24 px), forma (`--radius`, `--tap-min: 44px`) y PDF (`--pdf-primary`, `--pdf-text`, `--pdf-muted`, `--pdf-line`, `--pdf-fill`, declaradas como **hex literales**, porque pdfmake solo acepta hex). Ningún color, tamaño de letra ni separación literal fuera de `:root` (salvo los hex de `--pdf-*` dentro de `:root`). Texto normal ≥ 4,5:1 y bordes de controles/texto grande ≥ 3:1. Conservar las clases existentes (`.card`, `.field`, `.btn*`, `.actions`, `.row-between`, `.badge*`, `.notice-error/info/success`, `.list-item`, `.summary`, `.line*`, `.dialog*`, `.fullscreen-notice`, `.table*` con modo tarjeta bajo 600 px, `.paper*`) y añadir las nuevas: `.nav` en `display:flex; flex-wrap:wrap` con cada enlace `flex:1 1 auto` y `min-height: var(--tap-min)` (5 secciones visibles a 360 px, segunda fila si no caben, sin `overflow-x` ni menú plegable), resaltado de `.nav a.active`, estado `:disabled`, `.badge-borrador` (fondo suave de aviso + borde **punteado**), `.badge-completo` (relleno de éxito, borde sólido) y `.badge-note` (etiqueta neutra para notas como "Incompleta", visualmente distinta de los dos estados), `.home-*` (resumen y accesos), y jerarquía: `h1` en `--fs-title` negrita, `h2` en `--fs-subtitle` negrita, `.summary .total` en `--fs-subtitle` negrita con borde superior marcado, cabecera de tabla con fondo suave y negrita, importes alineados a la derecha.
- [X] T003 [P] Crear `src/app/sections.ts` que exporte `SECTIONS` (lista ordenada, una sola fuente) con `{ href, label, description }`: Inicio `/`, Presupuestos `/presupuestos`, Clientes `/clientes`, Catálogo `/servicios`, Perfil `/configuracion`; `description` es la frase corta de qué contiene cada sección (solo se usa en el inicio, para las cuatro secciones distintas de Inicio). Texto en español de Colombia.

**Checkpoint**: Sistema visual y lista de secciones listos

---

## Phase 3: User Story 1 - Página de inicio con acceso claro a todo (Priority: P1) 🎯 MVP

**Goal**: La raíz `#/` muestra el Inicio con resumen por estado y cuatro accesos; el listado pasa a `#/presupuestos`.

**Independent Test**: Quickstart 1, 2, 3, 6 y 8: abrir `/`, comparar resumen con el listado, probarlo sin datos, abrir direcciones directas antiguas y ver el error "…en Perfil.".

### Implementation for User Story 1

- [X] T004 [P] [US1] Crear `src/screens/home-summary.ts` con la función pura `countByStatus(quotes: Quote[]): { borradores: number; completos: number; total: number }` (cuenta por `status` `'BORRADOR'` y `'COMPLETO'`; `total = borradores + completos`). Importar el tipo `Quote` de `src/domain/types.ts`. Sin acceso a almacenamiento ni DOM.
- [X] T005 [P] [US1] Crear `tests/screens/home-summary.test.ts` (Vitest) para `countByStatus`: lista vacía → ceros; mezcla de borradores y completos → conteos correctos; `total` igual a la suma y a `quotes.length`.
- [X] T006 [P] [US1] En `src/domain/quote-rules.ts` línea ~30 cambiar solo el literal a `'Completa tu nombre y NIT/CC en Perfil.'` (sin tocar lógica ni condiciones) y actualizar el mismo texto en `tests/domain/dates-rules.test.ts` (~línea 28) y `tests/storage/quotes-repo-complete.test.ts` (~línea 64) (FR-002, plan punto 8).
- [X] T007 [US1] Crear `src/screens/Home.tsx`: título **PresupuestosPro**; llama a `listQuotes()` de `src/storage/quotes-repo.ts` y usa `countByStatus` (T004) para mostrar Borradores, Completos y Total con las etiquetas de estado `badge badge-borrador` / `badge badge-completo` y el texto "BORRADOR"/"COMPLETO" (FR-013); mientras carga muestra "Cargando…" y si la lectura falla un `notice-error` con `describeStorageError` de `src/app/messages.ts`; botón **Nuevo presupuesto** (`Link` a `/presupuestos/nuevo`) con `btn btn-primary`, destacado cuando el total es 0; cuatro accesos (Presupuestos, Clientes, Catálogo, Perfil) generados desde `SECTIONS` (T003, omitiendo Inicio) con su `description`, como `GuardedLink`. Solo clases de `styles.css`, sin estilos en línea. Sin importes ni gráficos (Assumptions).
- [X] T008 [US1] En `src/app/App.tsx`: reemplazar la constante `NAV` por `SECTIONS` de `src/app/sections.ts`; importar `Home`; cambiar la ruta `"/"` a `Home` y añadir `<Route path="/presupuestos" component={QuotesList} />` antes de `/presupuestos/nuevo`; mantener intactas `/presupuestos/nuevo`, `/presupuestos/:id/vista`, `/presupuestos/:id`, `/clientes`, `/servicios`, `/configuracion` y el 404. Ajustar `active` en `Nav`: Inicio activo solo con `loc === '/'`; Presupuestos activo con `loc === '/presupuestos'` o que empiece por `/presupuestos/`; el resto por `startsWith(href)`. Mantener `GuardedLink` en los enlaces. (Carga, aviso de pestaña duplicada y error de almacenamiento quedan sin `Nav`, FR-005.)
- [X] T009 [P] [US1] En `src/screens/QuoteEditor.tsx` cambiar `navigate('/')` (~línea 296) a `navigate('/presupuestos')` y el `GuardedLink href="/"` "← Volver al listado" (~línea 308) a `href="/presupuestos"`. Revisar también `src/screens/QuotesList.tsx` y `src/screens/QuotePreview.tsx` y reemplazar cualquier otro destino `/` pensado como "volver al listado" por `/presupuestos` (FR-007, contrato de rutas).
- [X] T010 [P] [US1] En `src/screens/Settings.tsx` cambiar el título `<h1>` de "Configuración" a "Perfil" y el mensaje "Configuración guardada." a "Perfil guardado."; conservar la subsección `<h2>Configuración fiscal</h2>`. En `src/screens/Services.tsx` cambiar `<h1>Servicios</h1>` a `<h1>Catálogo</h1>`. Revisar el resto de textos visibles de `src/screens/*.tsx` y `src/app/messages.ts` y renombrar cualquier mención restante de "Servicios"/"Configuración" como nombre de sección (FR-002, quickstart 7).

**Checkpoint**: US1 funcional: inicio, nuevas direcciones y nombres unificados

---

## Phase 4: User Story 2 - Navegación común desde cualquier página (Priority: P1)

**Goal**: Barra común visible en todas las pantallas (salvo aviso de pestaña duplicada), con sección actual resaltada y respeto del aviso de cambios sin guardar.

**Independent Test**: Quickstart 4, 5 y 11 (barra a 360 px).

### Implementation for User Story 2

- [X] T011 [US2] Verificar y completar en `src/app/App.tsx` y `src/styles.css` la barra `Nav`: (a) los cinco enlaces de `SECTIONS` (Inicio, Presupuestos, Clientes, Catálogo, Perfil) se muestran en todas las pantallas del `Router` (Inicio, listado, nuevo, editor, vista previa, Clientes, Catálogo, Perfil, 404) y no en `AlreadyOpen`; (b) sus enlaces usan `GuardedLink` de `src/app/GuardedLink.tsx` para conservar la advertencia de cambios sin guardar (FR-006); (c) a 360 px las cinco secciones quedan visibles repartiendo el ancho, con segunda fila si no caben, sin desplazamiento horizontal de la página ni de la barra y con altura ≥ `--tap-min`; (d) la sección actual se ve resaltada en todas las subpáginas de Presupuestos. No modificar `GuardedLink.tsx`.

**Checkpoint**: US1 + US2 funcionan; la navegación es completa

---

## Phase 5: User Story 3 - Apariencia visual profesional y consistente (Priority: P1)

**Goal**: Todas las pantallas usan el mismo sistema visual; estados BORRADOR/COMPLETO distinguibles; mobile-first sin desplazamiento horizontal.

**Independent Test**: Quickstart 9, 10, 11, 12 y 15.

### Implementation for User Story 3

- [X] T012 [P] [US3] Aplicar el sistema visual a `src/screens/QuotesList.tsx`: cabecera con título y botón "Nuevo presupuesto", elementos de lista con jerarquía clara y etiqueta de estado (`badge badge-borrador` / `badge badge-completo`, siempre con texto), estado vacío que guíe a crear el primer presupuesto; quitar estilos en línea si los hay. Mismo contenido y acciones que 001.
- [X] T013 [P] [US3] Aplicar el sistema visual a `src/screens/QuoteEditor.tsx`: sustituir el estilo en línea del botón de catálogo (~línea 393: `width`, `marginBottom`, `justifyContent`) por una clase en `src/styles.css`; formularios con etiqueta pequeña sobre campo de alto `--tap-min`; bloque de totales (`.summary`) con TOTAL destacado; etiquetas de estado BORRADOR/COMPLETO (~líneas 102 y 306) con `badge-borrador`/`badge-completo`; la etiqueta "Incompleta" (~línea 350) pasa a `badge badge-note` para no confundirse con un estado; mensajes con `notice-error/info/success`. No cambiar lógica ni textos funcionales.
- [X] T014 [P] [US3] Aplicar el sistema visual a `src/screens/QuotePreview.tsx` y `src/document/preview.tsx`: misma estructura y contenido (FR-019), hoja `.paper` con jerarquía (título, bloques Profesional/Cliente, tabla con cabecera de fondo suave, totales destacados); el contenido de `renderPreviewRows` no cambia. Sin estilos en línea con colores o tamaños literales.
- [X] T015 [P] [US3] Aplicar el sistema visual a `src/screens/Clients.tsx`, `src/screens/Services.tsx`, `src/screens/Settings.tsx` y `src/screens/AlreadyOpen.tsx`: solo clases de `src/styles.css`; formularios, listas, diálogos y avisos coherentes; `AlreadyOpen` conserva su aviso a pantalla completa sin navegación.
- [X] T016 [US3] Auditar `src/styles.css` y `src/**/*.tsx`: (a) `grep -nE "#[0-9a-fA-F]{3,6}|rgba?\(" src/styles.css` debe dar coincidencias solo dentro del bloque `:root`; (b) `grep -rn "style=" src` no debe dejar colores, tamaños de letra ni separaciones literales; (c) comprobar con un medidor de contraste los pares texto/fondo de `:root` (≥ 4,5:1 texto normal, ≥ 3:1 texto grande y bordes de controles, FR-015/SC-010); corregir lo que falle en `:root`.

**Checkpoint**: Aplicación visualmente consistente

---

## Phase 6: User Story 4 - PDF con la misma imagen profesional (Priority: P2)

**Goal**: PDF con la paleta y jerarquía de la app, contenido idéntico, colores tomados de las variables CSS.

**Independent Test**: Quickstart 12, 13, 14 y 17.

### Implementation for User Story 4

- [X] T017 [US4] Ajustar `tests/document/preview-pdf-same-model.test.ts`: pasar un objeto de tema (`{ primary, text, muted, line, fill }` con hex de prueba) como segundo argumento de `buildPdfDefinition`, manteniendo sus aserciones de "vista previa y PDF salen del mismo modelo". Hacer junto con T018 para que `npm test` y `npm run build` no queden en rojo.
- [X] T018 [US4] En `src/document/pdf.ts` definir y exportar `PdfTheme` (`{ primary: string; text: string; muted: string; line: string; fill: string }`) y cambiar la firma a `buildPdfDefinition(doc: QuoteDocument, theme: PdfTheme)`. Aplicar solo estilo (A4, márgenes 40 pt y Roboto sin cambio): título **PRESUPUESTO** en `theme.primary` con una línea de acento debajo; rótulos "Profesional" y "Cliente" en `theme.primary`; cabecera de tabla con fondo `theme.fill` y texto en negrita; filas separadas por línea suave `theme.line` (layout propio en lugar de `lightHorizontalLines`); fila **TOTAL** resaltada y Base/IVA/retención en `theme.muted`; texto general en `theme.text`; importes a la derecha; `dontBreakRows` y `headerRows: 1` se conservan para varias páginas; las celdas de descripción ajustan el texto largo en varias líneas sin romper la tabla; documento equilibrado sin logo. NO añadir contenido (ni numeración, ni pies, ni textos nuevos): mismos textos, importes, formatos y nombre de archivo (FR-018).
- [X] T019 [US4] En `src/document/pdf.ts` `downloadPdf`: antes de generar, leer `--pdf-primary`, `--pdf-text`, `--pdf-muted`, `--pdf-line` y `--pdf-fill` con `getComputedStyle(document.documentElement).getPropertyValue(...).trim()`, construir el `PdfTheme` y pasarlo a `buildPdfDefinition(doc, theme)`. Sin colores de respaldo: las variables siempre existen en `:root` (T002).
- [X] T020 [US4] Ejecutar `npm test` y confirmar que `tests/document/preview-pdf-same-model.test.ts` y `tests/document/quote-document.test.ts` pasan con la nueva firma; confirmar que `quote-document.ts` y el nombre de archivo no cambiaron.

**Checkpoint**: Las cuatro historias funcionan

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T021 Ejecutar `npm test` y `npm run build`: todas las pruebas de 001 y la nueva de conteo pasan; sin errores de tipos (SC-008).
- [ ] T022 Recorrer `specs/002-presentacion-profesional/quickstart.md` escenarios 1–17 (incluido 360 px, la segunda pestaña y el texto largo con tildes y ñ) y registrar resultados; en el escenario 12 cambiar `--c-primary` en `src/styles.css`, comprobar el efecto en app y PDF y revertir el cambio.
- [X] T023 [P] Verificar (el proyecto no es un repositorio git; revisar los archivos directamente) que hay cero cambios de lógica en `src/domain/` (solo el literal de T006) y `src/storage/`, y que `package.json` no tiene dependencias nuevas (FR-020, constitución I y III).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → historias → **Polish (7)**
- US1 (T004–T010) depende de T002 y T003. US2 (T011) depende de T008. US3 (T012–T016) depende de T002; T016 al final de US3. US4 (T017–T020) depende de T002 (variables `--pdf-*`); T017 y T018 se hacen juntas.

### Within Stories

- US1: T004, T005, T006, T009, T010 en paralelo; T007 tras T004; T008 tras T003 y T007.
- US3: T012–T015 en paralelo (archivos distintos); T016 después.
- US4: T017 + T018 → T019 → T020.

### Parallel Opportunities

```text
# Tras T002/T003, en paralelo:
T004 · T005 · T006 · T009 · T010
# US3 en paralelo:
T012 · T013 · T014 · T015
```

## Implementation Strategy

### MVP (User Story 1)

1. T001 → T002–T003 → T004–T010
2. **Parar y validar** con quickstart 1, 2, 3, 6, 8.

### Incremental

1. + US2 (navegación) → validar 4, 5, 11
2. + US3 (estilo) → validar 9, 10, 12, 15
3. + US4 (PDF) → validar 13, 14, 17
4. Polish (T021–T023)

## Notes

- Cada tarea cita archivos exactos; no introducir dependencias, fuentes descargadas ni estados nuevos (BORRADOR y COMPLETO únicamente).
- Foco visible por teclado y atributos ARIA no se piden en la spec y quedan fuera (Principio III); podrían proponerse en una spec futura.
- Las pruebas automáticas se limitan a las que el plan declara; la verificación visual es manual con quickstart.md.
