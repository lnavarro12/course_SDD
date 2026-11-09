# Tasks: PresupuestosPro — Presupuestos profesionales en PDF

**Input**: Documentos de diseño en `/specs/001-presupuestos-pdf/` (plan.md, spec.md, data-model.md, research.md, quickstart.md, contracts/)

**Prerequisites**: plan.md, spec.md (ambos presentes)

**Tests**: El plan (Technical Context + quickstart §4) pide pruebas automáticas con Vitest + `fake-indexeddb` para reglas de negocio, almacenamiento y modelo del documento. Se incluyen como tareas de prueba SOLO en esas tres áreas (`tests/domain/`, `tests/storage/`, `tests/document/`). Las pantallas se verifican a mano con el quickstart §3 (no se crean pruebas de UI).

**Organization**: Tareas agrupadas por historia de usuario. Todos los textos de interfaz y mensajes están en español de Colombia y se toman literalmente de `contracts/pantallas-y-rutas.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia a la que pertenece (US1…US7)
- Todas las rutas son relativas a la raíz del repositorio (`/Users/leidynavarroosorio/Documents/estudio/course_sdd/topic_2/budgetpro`)

## Convenciones transversales (aplican a todas las tareas)

- Dinero: **pesos enteros** (`number` entero). Cantidades: **centésimas** (1,5 → `150`). Nunca usar decimales de punto flotante para importes.
- Redondeo: "medio hacia arriba" al peso, con aritmética de enteros.
- Formato de importes `$1.234.567`; fechas `DD/MM/AAAA`; zona horaria `America/Bogota`.
- Capas: `domain/` no importa React ni IndexedDB; `storage/` es el único que conoce IndexedDB; `document/` es la única fuente del contenido del presupuesto.
- Sin variables de entorno, sin claves, sin servidor, sin analítica.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar el proyecto único (frontend estático)

- [X] T001 Crear `package.json` en la raíz con scripts `dev` (vite), `build` (tsc --noEmit && vite build), `preview` (vite preview), `test` (vitest run); dependencias de ejecución: `react@18`, `react-dom@18`, `idb`, `pdfmake`, `wouter`; dependencias de desarrollo: `typescript@5`, `vite`, `@vitejs/plugin-react`, `vite-plugin-pwa`, `vitest`, `fake-indexeddb`, `@types/react`, `@types/react-dom`, `@types/pdfmake`; fijar `"engines": {"node": ">=20"}`; luego ejecutar `npm install`
- [X] T002 Crear `tsconfig.json` (strict true, target ES2022, jsx react-jsx, moduleResolution bundler) y `vite.config.ts` con `@vitejs/plugin-react` y `vite-plugin-pwa` (registerType `autoUpdate`, precache de todos los archivos estáticos para funcionar sin conexión, manifest con nombre "PresupuestosPro", `display: standalone`, iconos `icons/icon-192.png` e `icons/icon-512.png`, `lang: es-CO`); incluir en el mismo archivo el bloque `test` de Vitest (`environment: 'node'`, `setupFiles: ['tests/setup.ts']`)
- [X] T003 [P] Crear `index.html` (lang `es-CO`, meta viewport `width=device-width, initial-scale=1`, contenedor `#root`, script `/src/main.tsx`) y `src/main.tsx` que monta `<App />` de `src/app/App.tsx` en modo estricto
- [X] T004 [P] Crear los iconos de instalación `public/icons/icon-192.png` y `public/icons/icon-512.png` (imágenes PNG simples con la inicial "P")
- [X] T005 [P] Crear `src/styles.css`: diseño móvil primero desde 360 px (una columna, botones táctiles de mínimo 44 px de alto, sin scroll horizontal), variables CSS de color y espaciado, clases base para formularios, botones (`.btn`, `.btn-primary`, `.btn-danger`), tarjetas, etiquetas de estado (`.badge-borrador`, `.badge-completo`), avisos (`.notice-error`, `.notice-info`, `.notice-success`) y tablas que pasan a tarjetas bajo 600 px; importarlo desde `src/main.tsx`
- [X] T006 [P] Crear `tests/setup.ts` que importa `fake-indexeddb/auto` para que todas las pruebas usen IndexedDB simulado

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Reglas de dominio, apertura de la base local y estructura de navegación. Bloquea todas las historias.

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta terminar esta fase

- [X] T007 Crear `src/domain/types.ts` con los tipos de `data-model.md`: `ClientType = 'PERSONA_NATURAL' | 'EMPRESA'`; `QuoteStatus = 'BORRADOR' | 'COMPLETO'`; `WithholdingPct = 4 | 6 | 10 | 11`; `Profile` (name, taxId obligatorios; email, phone, address, logo opcionales; logo como `Blob | string` data URL); `Settings` (`withholdingPct`); `Client` (id, name, type, taxId, email, phone, address); `Service` (id, code, codeKey, description, `price` entero ≥ 0); `QuoteLine` (id, description, `quantityHundredths: number | null`, `unitPrice: number | null`, `amount?` solo COMPLETO, `sourceServiceId?`, `sourcePriceAtAdd?`); `Quote` como unión discriminada por `status` (BORRADOR: `clientId: string | null`; COMPLETO: `number`, `issueDate`, `dueDate`, `issuer`, `client`, `withholdingPctApplied: 0|4|6|10|11`, `totals {base, iva, withholding, total}`), con `id`, `createdAt`, `updatedAt`, `lines`; constante `IVA_PCT = 19`
- [X] T008 [P] Crear `src/domain/money.ts`: `roundHalfUp(numerator, denominator)` con enteros (medio hacia arriba, solo no negativos), `formatCOP(n)` → `$1.234.567` (punto como separador de miles, sin decimales, negativos como `-$73.700`), `formatQuantity(hundredths)` → `1`, `1,5`, `2,25` (coma decimal solo si es necesaria), `parseQuantity(text)` → centésimas o `null` si no es numérico (acepta coma o punto, máximo 2 decimales), `parsePrice(text)` → entero o `null` (rechaza no numéricos)
- [X] T009 [P] Crear `src/domain/dates.ts`: `todayInBogota(now = new Date())` → `AAAA-MM-DD` usando `Intl.DateTimeFormat` con `timeZone: 'America/Bogota'`; `addDays(isoDate, 30)` en días naturales sin depender de la zona del dispositivo; `formatDate(iso)` → `DD/MM/AAAA`; `yearOf(iso)` → número
- [X] T010 Crear `src/domain/calc.ts` (depende de T007, T008): `lineAmount(qtyHundredths, price)` = `roundHalfUp(qty × price, 100)`; `isLineCalculable(line)` (cantidad > 0 y precio ≥ 0 numéricos); `calcTotals(lines, client | null, withholdingPct)` devolviendo `{ base, iva, withholding | null, total | null }` donde `base` = suma de importes de líneas calculables, `iva` = `roundHalfUp(base × 19, 100)`, `withholding` = cliente `EMPRESA` ? `roundHalfUp(base × pct, 100)` : 0, `total` = base + iva − withholding; si no hay cliente, `withholding` y `total` son `null` (la UI muestra "Selecciona un cliente para calcular la retención y el total.")
- [X] T011 Crear `src/domain/quote-rules.ts` (depende de T007, T010): `isLineValid(line)` (descripción no vacía tras `trim`, cantidad > 0, precio ≥ 0); `validateForCompletion(quote, client, profile)` devolviendo lista de mensajes exactos del contrato: "Selecciona un cliente.", "Agrega al menos una línea.", "La línea N necesita una descripción.", "La cantidad de la línea N debe ser mayor que cero.", "El precio de la línea N no puede ser negativo.", "Completa tu nombre y NIT/CC en Configuración." (N empieza en 1); `validateDraftNumbers(lines)` que solo rechaza valores no numéricos con "La cantidad debe ser un número." / "El precio debe ser un número."
- [X] T012 Crear `src/storage/db.ts` con `idb`: `openAppDb()` que abre la base `presupuestospro` versión 1 con almacenes `profile` (clave fija `main`), `settings` (clave fija `main`), `clients` (keyPath `id`), `services` (keyPath `id`, índice único `codeKey`), `quotes` (keyPath `id`, índices `status` y `updatedAt`), `counters` (clave = año); exportar `getDb()` memoizado y, ante fallo al abrir, lanzar `StorageUnavailableError` (clase en el mismo archivo) cuyo mensaje es "No se puede guardar información en este navegador. Revisa que no estés en modo privado y que haya espacio disponible."; exportar `newId()` con `crypto.randomUUID()`
- [X] T013 [P] Crear `src/app/messages.ts` con todas las cadenas de la tabla "Mensajes clave" de `specs/001-presupuestos-pdf/contracts/pantallas-y-rutas.md` como constantes exportadas (y funciones para las que llevan parámetros: `quoteSaved(number)`, `catalogPriceChanged(name, before, after)`), de modo que ningún componente escriba mensajes en línea
- [X] T014 Crear `src/app/App.tsx` con `wouter` en modo hash (`useHashLocation`): rutas `/` → `QuotesList`, `/presupuestos/nuevo` → `QuoteEditor`, `/presupuestos/:id` → `QuoteEditor`, `/presupuestos/:id/vista` → `QuotePreview`, `/clientes`, `/servicios`, `/configuracion`; barra de navegación simple (Presupuestos · Clientes · Servicios · Configuración); crear además componentes de relleno vacíos (`export default function X() { return null }`) en `src/screens/QuotesList.tsx`, `QuoteEditor.tsx`, `QuotePreview.tsx`, `Clients.tsx`, `Services.tsx`, `Settings.tsx` y `AlreadyOpen.tsx` para que compile; los reemplazan las historias siguientes
- [X] T015 [P] Crear `tests/domain/money-calc.test.ts`: `roundHalfUp` (0,5 sube, 0,49 baja), `formatCOP(1234567)` = `$1.234.567`, `formatQuantity(150)` = `1,5`, `parseQuantity('abc')` = `null`, `parseQuantity('1,555')` = `null`; cálculo con el ejemplo del spec (350.000 + 2×60.000 + 200.000): base 670.000, IVA 127.300, empresa 11 % → retención 73.700 y total 723.600; persona natural → retención 0 y total 797.300; empresa 4 % → retención 26.800 y total 770.500; sin cliente → `withholding` y `total` `null`; línea con cantidad 1,5 × 333 → importe redondeado medio hacia arriba; líneas parciales (sin cantidad o precio) excluidas de la base; precio 0 permitido
- [X] T016 [P] Crear `tests/domain/dates-rules.test.ts`: `todayInBogota` con instante `2026-12-31T23:30:00-05:00` da `2026-12-31` y con `2027-01-01T04:30:00Z` también `2026-12-31` (zona Bogotá); `addDays('2026-11-09', 30)` = `2026-12-09`; `formatDate('2026-11-09')` = `09/11/2026`; reglas de `quote-rules`: lista de errores para presupuesto sin cliente, sin líneas, línea sin descripción, cantidad 0, precio negativo y perfil sin nombre/NIT, con los textos exactos y numeración de línea desde 1; borrador con valores no numéricos se rechaza con el mensaje del campo

**Checkpoint**: Dominio y base listos — las historias pueden empezar

---

## Phase 3: User Story 1 - Abrir la aplicación sin cuenta y conservar mis datos (Priority: P1) 🎯 MVP

**Goal**: La app se abre sin cuenta, conserva datos, funciona sin conexión, permite una sola pestaña y reporta fallos de almacenamiento.

**Independent Test**: Registrar un dato (p. ej. un cliente, cuando exista US3, o un perfil), cerrar la pestaña, reabrir y comprobar que sigue; abrir una segunda pestaña y ver el aviso; desactivar la red tras la primera carga y comprobar que la app arranca.

### Tests for User Story 1

- [X] T017 [P] [US1] Crear `tests/storage/db.test.ts`: `getDb()` crea los seis almacenes y el índice único `codeKey`; los datos escritos persisten al cerrar y reabrir la conexión; si `indexedDB.open` falla (simulado con un `indexedDB` que lanza), `getDb()` lanza `StorageUnavailableError` con el mensaje del contrato

### Implementation for User Story 1

- [X] T018 [P] [US1] Crear `src/app/tab-lock.ts`: `acquireTabLock(): Promise<'acquired' | 'taken' | 'unsupported'>` usando `navigator.locks.request('presupuestospro-editor', { ifAvailable: true }, cb)`; si el bloqueo se obtiene, el callback devuelve una promesa que nunca se resuelve (mantiene el turno mientras la pestaña viva); si `ifAvailable` devuelve `null`, resultado `'taken'`; si `navigator.locks` no existe, `'unsupported'` (se permite continuar)
- [X] T019 [P] [US1] Implementar `src/screens/AlreadyOpen.tsx` con el mensaje "PresupuestosPro ya está abierta en otra pestaña o ventana. Ciérrala o úsala allí; aquí no se puede editar." (de `messages.ts`), sin enlaces de edición
- [X] T020 [US1] Integrar en `src/app/App.tsx` (depende de T018, T019): al montar, llamar `acquireTabLock()`; si `'taken'`, renderizar solo `AlreadyOpen` (sin navegación ni rutas); además llamar `navigator.storage?.persist?.()` una vez al iniciar, sin mostrar nada ni bloquear si falla; mientras se resuelve el bloqueo mostrar un estado de carga mínimo
- [X] T021 [US1] En `src/app/App.tsx`, al iniciar intentar `getDb()`; si lanza `StorageUnavailableError`, mostrar un aviso de pantalla completa con su mensaje (no una pantalla en blanco). Exportar desde `src/app/messages.ts` (no crear archivo aparte) un helper `describeStorageError(err)` que devuelve el mensaje correspondiente del contrato, para que las pantallas informen "qué ocurrió y qué hacer" (FR-004)
- [X] T022 [US1] Verificar en `vite.config.ts` que el service worker precachea `index.html`, JS, CSS e iconos y que `registerType: 'autoUpdate'` está activo; configurar `workbox.globPatterns` con `**/*.{js,css,html,png,woff2,ttf}` para que el precaché incluya también los chunks diferidos de `pdfmake` y sus fuentes (necesario para SC-007) y comprobar tras `npm run build` que `dist/sw.js` los lista; añadir en `src/main.tsx` el registro con `registerSW` de `virtual:pwa-register`; ejecutar `npm run build && npm run preview` y confirmar en la salida de `dist/` que existe `sw.js` y `manifest.webmanifest`

**Checkpoint**: La app arranca sin cuenta, una sola pestaña, avisa si no hay almacenamiento y queda instalada para uso sin conexión

---

## Phase 4: User Story 2 - Configurar mis datos profesionales y fiscales (Priority: P1)

**Goal**: Registrar perfil (con logo) y porcentaje de retención.

**Independent Test**: Llenar la configuración, guardar, cerrar y reabrir; los datos y el logo siguen ahí; un logo no PNG/JPG o > 2 MB se rechaza.

### Tests for User Story 2

- [X] T023 [P] [US2] Crear `tests/storage/profile-repo.test.ts`: guardar y leer perfil; rechazo con mensaje que nombra el campo cuando falta `name` o `taxId` ("El nombre o razón social es obligatorio." / "El NIT/CC es obligatorio."); `settings` por defecto `withholdingPct` = 11; solo se aceptan 4, 6, 10 y 11 (otro valor lanza error)

### Implementation for User Story 2

- [X] T024 [US2] Crear `src/storage/profile-repo.ts` (depende de T012): `getProfile()`, `saveProfile(profile)` (valida `name` y `taxId` obligatorios tras `trim`; clave fija `main` en `profile`), `getSettings()` (devuelve `{ withholdingPct: 11 }` si no existe), `saveSettings(settings)` (solo 4, 6, 10, 11)
- [X] T025 [P] [US2] Crear `src/app/logo-resize.ts`: `validateLogoFile(file)` que acepta solo `image/png` e `image/jpeg` y tamaño ≤ 2 MB (2 × 1024 × 1024 bytes), en caso contrario lanza error con el mensaje "El logo debe ser una imagen PNG o JPG de hasta 2 MB."; `resizeLogo(file)` que reduce a un máximo de 600 px de ancho manteniendo proporción (canvas, sin deformar) y devuelve un data URL PNG/JPG
- [X] T026 [US2] Implementar `src/screens/Settings.tsx` (depende de T024, T025): formulario con nombre o razón social*, NIT/CC*, correo, teléfono, dirección, selector/carga de logo con vista previa; sección fiscal con IVA "19 %" mostrado como texto fijo no editable y selector de retención con opciones 4 %, 6 %, 10 %, 11 % (11 % por defecto); botón Guardar que muestra el mensaje del campo obligatorio faltante; el logo inválido muestra el mensaje del contrato sin bloquear la pantalla; al abrir carga los datos guardados; errores de almacenamiento vía `describeStorageError`

**Checkpoint**: Perfil y retención configurables y persistentes

---

## Phase 5: User Story 3 - Gestionar mis clientes (Priority: P1)

**Goal**: CRUD de clientes con tipo, advertencia de NIT/CC duplicado y efectos al eliminar.

**Independent Test**: Crear un cliente, verlo en la lista, editarlo y eliminarlo; probar NIT duplicado; eliminar un cliente usado por un borrador.

### Tests for User Story 3

- [X] T027 [P] [US3] Crear `tests/storage/clients-repo.test.ts`: crear cliente EMPRESA sin NIT/CC se rechaza ("El NIT/CC es obligatorio para empresas."); PERSONA_NATURAL sin NIT se acepta; sin `name` o sin `type` se rechaza indicando el campo; `findByTaxId` detecta duplicado (ignorando el propio id) pero `saveClient` permite guardar; `deleteClient(id)` deja `clientId = null` en los borradores que lo usaban y no modifica los presupuestos COMPLETO (insertar quotes directamente en el almacén `quotes` con `fake-indexeddb` para la prueba)

### Implementation for User Story 3

- [X] T028 [US3] Crear `src/storage/clients-repo.ts` (depende de T012): `listClients()` ordenado por nombre, `getClient(id)`, `saveClient(client)` (validaciones: `name` y `type` obligatorios; `taxId` obligatorio si `EMPRESA`; `email`, `phone`, `address` opcionales), `findByTaxId(taxId, excludeId?)` comparando sin espacios sobrantes, `deleteClient(id)` en una sola transacción sobre `clients` y `quotes` que borra el cliente y pone `clientId = null` en los presupuestos con `status === 'BORRADOR'` que lo referencian (los COMPLETO no se tocan)
- [X] T029 [US3] Implementar `src/screens/Clients.tsx` (depende de T028): lista (nombre, tipo "Persona natural"/"Empresa" visible, NIT/CC), botón Nuevo cliente, formulario de crear/editar con nombre*, tipo* (selector explícito), NIT/CC (marcado obligatorio cuando el tipo es empresa), correo, teléfono, dirección; al guardar con NIT/CC repetido mostrar "Ya tienes un cliente con este NIT/CC. ¿Guardar de todos modos?" con confirmar/cancelar; eliminar con confirmación simple; errores de validación indican el campo; errores de almacenamiento vía `describeStorageError`. Exportar también un componente reutilizable `ClientForm` (mismo archivo) para que el editor de presupuestos cree un cliente "en el momento" (US5)

**Checkpoint**: Clientes funcionales y persistentes

---

## Phase 6: User Story 4 - Mantener un catálogo de servicios (Priority: P2)

**Goal**: CRUD de servicios con código único sin distinguir mayúsculas. (Se construye antes de US5 porque el editor de presupuestos usa `services-repo`; sigue siendo independientemente comprobable.)

**Independent Test**: Crear, listar, editar y eliminar servicios; intentar crear `logo-01` con `LOGO-01` ya existente.

### Tests for User Story 4

- [X] T030 [P] [US4] Crear `tests/storage/services-repo.test.ts`: `LOGO-01` y luego `logo-01` (y ` Logo-01 `) → segundo rechazado con "Ya existe un servicio con ese código."; editar un servicio conservando su propio código se permite; sin descripción → error indicando el campo; precio negativo → error; precio 0 se acepta; precio no entero se rechaza; `suggestCode(description)` genera un código no existente

### Implementation for User Story 4

- [X] T031 [US4] Crear `src/storage/services-repo.ts` (depende de T012): `listServices()` ordenado por código, `getService(id)`, `saveService(service)` que calcula `codeKey = code.trim().toLowerCase()`, valida `code` y `description` obligatorios, `price` entero ≥ 0, y unicidad de `codeKey` (apoyándose en el índice único y devolviendo el mensaje "Ya existe un servicio con ese código."), `deleteService(id)`, `suggestCode(description)` (iniciales en mayúsculas + `-01`, incrementando hasta que no exista)
- [X] T032 [US4] Implementar `src/screens/Services.tsx` (depende de T031): lista (código, descripción, precio con `formatCOP`), formulario crear/editar con código*, descripción*, precio* (≥ 0, `parsePrice`), eliminar con confirmación; los mensajes de validación indican el dato a corregir. Exportar también `ServiceForm` reutilizable para guardar un concepto manual en el catálogo desde el editor (US5)

**Checkpoint**: Catálogo funcional

---

## Phase 7: User Story 5 - Crear, guardar como borrador y completar un presupuesto (Priority: P1)

**Goal**: Núcleo del producto: borradores editables con cálculo en vivo y finalización atómica con número y fechas.

**Independent Test**: Crear un presupuesto con las líneas del ejemplo, guardarlo como borrador, completarlo y comprobar base $670.000, IVA $127.300 y total $723.600 (empresa 11 %) / $797.300 (persona natural), número `AAAA-001`, vencimiento +30 días.

### Tests for User Story 5

- [X] T033 [P] [US5] Crear `tests/storage/quotes-repo-draft.test.ts`: `saveDraft` guarda un presupuesto vacío (sin cliente ni líneas) con estado BORRADOR, sin `number`, `issueDate` ni `dueDate`; guarda líneas parciales; rechaza cantidad/precio no numéricos; actualiza `updatedAt` en cada guardado; rechaza guardar sobre un presupuesto COMPLETO; guardar 5 borradores no crea ni modifica registros en `counters` (SC-013); `deleteDraft` elimina un borrador, rechaza uno COMPLETO y no toca `counters`
- [X] T034 [P] [US5] Crear `tests/storage/quotes-repo-complete.test.ts`: `completeQuote(draft)` (recibe el borrador en memoria) con el ejemplo del spec → estado COMPLETO, `number` `2026-001` (con reloj inyectable `now`), `issueDate` de Bogotá, `dueDate` +30 días, copia de `issuer` (perfil con logo) y `client`, `withholdingPctApplied` 11 (0 para persona natural), totales correctos, `amount` por línea; tres completados seguidos → `2026-001`, `2026-002`, `2026-003`; primer completado en año nuevo → `2027-001`; completar con validaciones fallidas (sin cliente, sin líneas, línea inválida, perfil sin nombre/NIT) lanza error con la lista de mensajes y no cambia presupuesto ni contador; **atomicidad**: pasar `hooks: { beforeCommit: () => { throw new Error('fallo simulado') } }`, que se ejecuta después de escribir el contador y el presupuesto dentro de la transacción; comprobar que la transacción se aborta, el presupuesto no existe como COMPLETO (sigue BORRADOR con su información anterior, o no existe si era nuevo), el contador no cambió y el siguiente completado recibe el número que tocaba (SC-017); completar un presupuesto nuevo nunca guardado deja un solo registro COMPLETO y el contador avanza en 1, y si la validación falla o se cancela no se crea ningún registro; un COMPLETO rechaza `saveDraft`, `completeQuote` repetido y `deleteDraft`; cambiar luego perfil, logo, cliente, catálogo y porcentaje no altera el COMPLETO (SC-009); número con 4 dígitos tras 999 (`2026-1000`)

### Implementation for User Story 5

- [X] T035 [US5] Crear `src/storage/quotes-repo.ts` (depende de T010, T011, T012, T009): `listQuotes()` (todos, más recientes primero), `getQuote(id)`, `saveDraft(quote)` (crea o actualiza; valida con `validateDraftNumbers`; rechaza si el existente es COMPLETO; fija `updatedAt`), `deleteDraft(id)` (rechaza COMPLETO; no toca `counters`), y `completeQuote(draft: DraftQuote, opts?: { now?: Date; hooks?: { beforeCommit?: () => void } })` que recibe el borrador en memoria (nuevo o ya guardado) y en **una sola transacción `readwrite`** sobre `quotes`, `counters`, `clients`, `profile` y `settings`: si ya existe un registro con ese id y no es BORRADOR, rechaza; valida con `validateDraftNumbers` y repite `validateForCompletion` (leyendo cliente, perfil y configuración dentro de la transacción), calcula `lineAmount` y `calcTotals`, toma `issueDate = todayInBogota(now)`, año = `yearOf(issueDate)`, incrementa `counters[año]`, genera `number = \`${año}-${String(n).padStart(3, '0')}\``, `dueDate = addDays(issueDate, 30)`, copia `issuer` (perfil), `client` y `withholdingPctApplied` (0 si persona natural), elimina `clientId` y `sourceServiceId`/`sourcePriceAtAdd` de las líneas, y escribe `status: 'COMPLETO'` con `put` (esto crea el registro si el presupuesto era nuevo); justo antes de confirmar la transacción invoca `opts.hooks?.beforeCommit?.()` (punto de inyección solo para pruebas); cualquier error aborta la transacción (`tx.abort()`) y se propaga. Mapear errores de almacenamiento al mensaje "No se pudo guardar el presupuesto. No se perdió ningún dato y sigue como borrador. Libera espacio en tu dispositivo e inténtalo de nuevo."
- [X] T036 [US5] Implementar el esqueleto de `src/screens/QuoteEditor.tsx` (depende de T035, T014): lee `:id` de la ruta; en `/presupuestos/nuevo` crea estado local de borrador sin escribir en almacenamiento; en `/presupuestos/:id` carga con `getQuote`; si el id no existe muestra "Este presupuesto no está disponible."; si el estado es `COMPLETO` renderiza el modo solo lectura (todos los campos como texto, sin botones Guardar borrador / Guardar presupuesto / Eliminar, con enlaces **Vista previa** y **Descargar PDF** que apuntan a `#/presupuestos/:id/vista`), cubriendo FR-034, FR-037 y la ruta directa; si es BORRADOR renderiza el modo edición
- [X] T037 [US5] En `src/screens/QuoteEditor.tsx`, sección de cliente (depende de T036, T029): selector de clientes existentes (carga `listClients()`), botón "Crear cliente nuevo" que abre `ClientForm` en línea y selecciona el cliente creado, posibilidad de cambiar o quitar el cliente en cualquier momento; al seleccionar se muestran sus datos y tipo; el cambio dispara recálculo inmediato usando el porcentaje de `getSettings()`
- [X] T038 [US5] En `src/screens/QuoteEditor.tsx`, sección de líneas (depende de T037, T031, T008): lista editable con descripción, cantidad (campo de texto parseado con `parseQuantity`, hasta 2 decimales) y precio (`parsePrice`); botón "Agregar del catálogo" que lista `listServices()` y carga descripción y precio habitual guardando `sourceServiceId` y `sourcePriceAtAdd`, bloqueando un servicio ya presente con "Este servicio ya está en el presupuesto."; botón "Agregar concepto manual"; tras confirmar un concepto manual ofrecer "¿Guardarlo en el catálogo?" y, si acepta, abrir `ServiceForm` con código propuesto por `suggestCode` y enlazar la línea al servicio creado; botón eliminar por línea; editar una línea nunca modifica el catálogo; las líneas incompletas se marcan visualmente como "Incompleta"
- [X] T039 [US5] En `src/screens/QuoteEditor.tsx`, resumen económico (depende de T038, T010): mostrar Base, IVA (19 %), Retención en la fuente (X %) y TOTAL con `formatCOP`, recalculando en cada cambio sin botón de calcular (SC-003); con cliente persona natural la retención se muestra como $0 sin presentarse como descuento; sin cliente mostrar base e IVA y, en retención y total, "Selecciona un cliente para calcular la retención y el total."; importes por línea mostrados con `lineAmount`
- [X] T040 [US5] En `src/screens/QuoteEditor.tsx`, acción **Guardar borrador** (depende de T039): llama `saveDraft`; si hay valores no numéricos muestra el mensaje del campo ("La cantidad debe ser un número." / "El precio debe ser un número.") y no guarda; éxito → "Borrador guardado.", el estado sigue BORRADOR, si era nuevo navega a `#/presupuestos/:id` con el id asignado; permite guardar repetidamente y continuar editando; errores de almacenamiento con `describeStorageError`. El parseo de campos numéricos debe conservar el texto digitado para no perder lo escrito mientras es inválido
- [X] T041 [US5] En `src/screens/QuoteEditor.tsx`, acción **Guardar presupuesto** (depende de T040): ejecuta `validateForCompletion` sobre el estado en memoria SIN escribir nada en almacenamiento; si hay errores, muestra "No se puede guardar el presupuesto. Corrige lo siguiente:" con la lista y no cambia nada; si pasa, muestra diálogo de confirmación "Al guardar el presupuesto quedará definitivo: no podrás modificarlo. ¿Deseas continuar?" (Cancelar no escribe nada: un presupuesto nuevo sigue sin existir en almacenamiento y un borrador conserva su última versión guardada); al confirmar llama `completeQuote(borradorEnMemoria)`, y en éxito muestra "Presupuesto guardado con el número {AAAA-NNN}." y pasa a la vista de solo lectura con acceso a Vista previa y Descargar PDF; en error muestra el mensaje de almacenamiento del contrato y el presupuesto sigue editable como BORRADOR
- [X] T042 [US5] En `src/screens/QuoteEditor.tsx`, aviso de cambio de precio del catálogo (depende de T038): al abrir un BORRADOR, para cada línea con `sourceServiceId` y `sourcePriceAtAdd`, comparar con el precio actual de `getService`; si cambió mostrar un aviso con `catalogPriceChanged(nombre, antes, ahora)` ("El precio de «{servicio}» cambió en el catálogo (antes {precio}, ahora {precio}). La línea conserva el precio con el que la agregaste.") sin modificar la línea; si el servicio fue eliminado no mostrar aviso ni cambiar la línea

**Checkpoint**: Se puede crear, guardar y completar presupuestos; US1–US5 funcionan juntas (MVP de datos; el PDF llega en US6)

---

## Phase 8: User Story 6 - Previsualizar y descargar el PDF (Priority: P1)

**Goal**: Vista previa y PDF idénticos generados desde un único modelo de documento, solo para presupuestos COMPLETO.

**Independent Test**: Con un presupuesto COMPLETO, abrir Vista previa, descargar `PRESUPUESTO-AAAA-NNN.pdf` y comparar contenido; un borrador muestra el bloqueo.

### Tests for User Story 6

- [X] T043 [P] [US6] Crear `tests/document/quote-document.test.ts`: `buildQuoteDocument(completeQuote)` produce título `PRESUPUESTO`, número, fechas `DD/MM/AAAA`, bloque del profesional y del cliente (tipo "Persona natural"/"Empresa"), filas con descripción · cantidad · precio unitario · importe **sin código de servicio**, resumen Base / IVA (19 %) / Retención en la fuente (X %) solo si el cliente es empresa / TOTAL con `formatCOP`; con persona natural no hay fila de retención; sin logo, `logo` es `null`; no contiene la palabra "factura" ni texto sobre envío por correo; nombre de archivo `PRESUPUESTO-2026-001.pdf`; usa los datos consolidados del presupuesto (cambiar perfil/catálogo después no altera el resultado); `buildQuoteDocument` lanza error si el presupuesto es BORRADOR
- [X] T044 [P] [US6] Crear `tests/document/preview-pdf-same-model.test.ts`: verificar que `preview.tsx` y `pdf.ts` consumen exactamente la salida de `buildQuoteDocument` (p. ej. `buildPdfDefinition(doc)` recibe el modelo y su contenido textual — descripciones, importes, totales — coincide fila por fila con lo que `renderPreviewRows(doc)` expone), y que `buildPdfDefinition` incluye repetición de encabezado de tabla (`headerRows: 1`) y `dontBreakRows`/ajuste de texto para descripciones largas

### Implementation for User Story 6

- [X] T045 [US6] Crear `src/document/quote-document.ts` (depende de T007, T008, T009): `buildQuoteDocument(quote: CompleteQuote): QuoteDocument` que devuelve contenido ya formateado (strings): `title: 'PRESUPUESTO'`, `number`, `issueDate`, `dueDate`, `issuer {name, taxId, email?, phone?, address?, logo: string | null}`, `client {name, typeLabel, taxId?, email?, phone?, address?}`, `rows [{description, quantity, unitPrice, amount}]`, `summary {base, iva, withholding?: {label: 'Retención en la fuente (X %)', value}, total}` (la retención solo si el cliente es EMPRESA, el valor se muestra como importe restado) y `fileName: 'PRESUPUESTO-AAAA-NNN.pdf'`; lanza error si `status !== 'COMPLETO'`; formato según `contracts/documento-presupuesto.md`
- [X] T046 [P] [US6] Crear `src/document/preview.tsx` (depende de T045): componente `QuotePreviewDocument({ doc })` que pinta el modelo con estilos de papel (encabezado con título y logo omitido sin dejar hueco si no hay logo, bloques profesional/cliente, tabla de detalle, resumen económico) y exporta `renderPreviewRows(doc)` usado en la prueba; sin lógica de cálculo propia
- [X] T047 [P] [US6] Crear `src/document/pdf.ts` (depende de T045): `buildPdfDefinition(doc)` que genera la definición `pdfmake` desde el mismo `QuoteDocument` (tabla con `headerRows: 1` que repite encabezado en páginas siguientes, ajuste de líneas en descripciones largas, logo con `fit` para no deformarlo, fuente Roboto embebida para que tildes y ñ se vean bien, importes alineados a la derecha) y `downloadPdf(doc)` que carga `pdfmake` y sus fuentes con `import()` dinámico solo al descargar y llama `pdfMake.createPdf(def).download(doc.fileName)`; si falla lanza error con "No se pudo generar el PDF. Inténtalo de nuevo; si continúa, cierra y vuelve a abrir la aplicación."; no escribe nada en almacenamiento
- [X] T048 [US6] Implementar `src/screens/QuotePreview.tsx` (depende de T035, T046, T047): lee `:id`, carga con `getQuote`; id inexistente → "Este presupuesto no está disponible."; si es BORRADOR muestra el bloqueo "Primero debes guardar el presupuesto como definitivo para verlo o descargarlo." con enlace de regreso al editor y sin renderizar documento ni botón de descarga; si es COMPLETO muestra `QuotePreviewDocument` y botones **Descargar PDF** (llama `downloadPdf(buildQuoteDocument(quote))`; único lugar donde se descarga; con estado "Generando…" y manejo de error con el mensaje del contrato) y Volver; descargar varias veces no escribe en el presupuesto
- [X] T049 [US6] Verificar en `src/screens/QuoteEditor.tsx` (depende de T036, T048) que en el modo solo lectura de COMPLETO **Vista previa** y **Descargar PDF** solo navegan a `#/presupuestos/:id/vista` (la descarga ocurre únicamente en `QuotePreview.tsx`, T048) y que en un BORRADOR esos botones no se muestran; abrir `#/presupuestos/:id/vista` de un borrador muestra el bloqueo (SC-016)

**Checkpoint**: Flujo completo de punta a punta: configurar → cliente → borrador → completar → vista previa → PDF

---

## Phase 9: User Story 7 - Consultar presupuestos y continuar borradores (Priority: P2)

**Goal**: Listado con estados, continuar borradores, eliminar borradores y avisos de cambios sin guardar.

**Independent Test**: Abrir un borrador desde el listado, cambiar un precio, guardar, completar y ver el listado actualizado; intentar editar el completo; eliminar un borrador y reabrir la app.

### Implementation for User Story 7

- [X] T050 [US7] Implementar `src/screens/QuotesList.tsx` (depende de T035): botón **Nuevo presupuesto** (a `#/presupuestos/nuevo`); sin presupuestos muestra "Aún no tienes presupuestos."; cada fila muestra etiqueta **BORRADOR** o **COMPLETO** y, según corresponda: número y fecha de emisión (solo completos), fecha de última modificación (solo borradores, `DD/MM/AAAA` hora Colombia), nombre del cliente si está definido (borrador: `getClient(clientId)`; completo: copia consolidada) y total solo si hay datos suficientes (borrador: `calcTotals` con cliente y porcentaje actuales; completo: `totals.total`); un borrador sin número ni fecha de emisión; filas ordenadas por `updatedAt`/emisión descendente; cada fila abre `#/presupuestos/:id`
- [X] T051 [US7] En `src/screens/QuotesList.tsx` añadir la acción **Eliminar** solo en filas BORRADOR (nunca en COMPLETO): confirmación "Se eliminará este borrador de forma definitiva. ¿Deseas continuar?"; confirmar llama `deleteDraft` y retira la fila; cancelar no cambia nada; si falla el almacenamiento el borrador permanece y se informa con `describeStorageError`
- [X] T052 [US7] En `src/screens/QuoteEditor.tsx` añadir el botón **Eliminar borrador** (solo BORRADOR ya guardado) con la misma confirmación y, al eliminar, volver a `#/`; en un presupuesto nuevo sin guardar no se muestra (depende de T041)
- [X] T053 [US7] Implementar aviso de cambios sin guardar (FR-005) en `src/screens/QuoteEditor.tsx` (depende de T052): mantener un indicador `dirty` comparando el estado actual con el último guardado; crear `src/app/GuardedLink.tsx`, un `Link` propio que, si hay cambios pendientes, intercepta el clic y muestra "Tienes cambios sin guardar en este borrador. Si sales, se perderán." con opciones Quedarme / Salir (usar `GuardedLink` en la navegación de `App.tsx` y en los enlaces del editor); para el botón atrás del navegador, escuchar `hashchange`: si `dirty`, restaurar el hash anterior con `history.pushState` y mostrar el mismo diálogo; registrar también `beforeunload` para cierre o recarga; quitar los manejadores al guardar o al desmontar; en COMPLETO nunca se activa
- [X] T054 [US7] Reforzar solo lectura en `src/screens/QuoteEditor.tsx` (depende de T036): confirmar que abrir directamente `#/presupuestos/:id` de un COMPLETO (recarga, pegar la dirección en otra pestaña) muestra solo lectura, que ningún control de edición se renderiza y que, aunque se manipule el DOM, `saveDraft`/`completeQuote`/`deleteDraft` rechazan (ya cubierto en T034); mostrar en la vista de solo lectura los valores consolidados (perfil, cliente, porcentaje aplicado, totales)

**Checkpoint**: Todas las historias funcionan

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Verificación contra spec y calidad general

- [X] T055 Ejecutar `npm test` y corregir cualquier fallo; ejecutar `npm run build` y confirmar que compila sin errores de TypeScript y que el chunk de `pdfmake` está separado del paquete principal (carga diferida)
- [ ] T056 [P] Revisar `src/styles.css` y todas las pantallas a 360 px de ancho: sin desplazamiento horizontal, botones táctiles, tablas convertidas en tarjetas; ajustar estilos de `src/styles.css` y de `src/document/preview.tsx` según haga falta
- [X] T057 [P] Revisar que todos los textos visibles (interfaz, mensajes, PDF) estén en español de Colombia y provengan de `src/app/messages.ts` cuando estén en el contrato; verificar tildes y ñ ("Diseño de pañuelos y señalización") en pantalla y PDF
- [X] T058 Auditoría de alcance fantasma: confirmar que no existen funciones fuera de la spec (respaldo/exportación, duplicar, anular, envío de correo, selector de idioma/moneda, mención de "factura"); eliminar cualquier código sobrante
- [ ] T059 Ejecutar `npm run preview` y recorrer los escenarios A–H y las "Otras comprobaciones rápidas" de `specs/001-presupuestos-pdf/quickstart.md` §3, incluyendo sin conexión con descarga de PDF y red desactivada (SC-007) y recálculo de totales en menos de 1 s (SC-003), una sola pestaña (FR-006) y cifras SC-002; registrar cualquier discrepancia y corregirla
- [X] T060 [P] Crear `README.md` en la raíz con los comandos de `quickstart.md` §1 y el paso de publicación §2 (arrastrar `dist/` a Netlify), y la advertencia de que los datos viven solo en el navegador (sin respaldo en la v1)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias
- **US1 (Phase 3)**, **US2 (Phase 4)**, **US3 (Phase 5)**, **US4 (Phase 6)**: dependen solo de Foundational; son independientes entre sí y pueden hacerse en paralelo
- **US5 (Phase 7)**: depende de Foundational y usa `profile-repo` (US2), `clients-repo`/`ClientForm` (US3) y `services-repo`/`ServiceForm` (US4); `QuoteEditor` puede empezar con mocks, pero lo práctico es terminar US2–US4 primero
- **US6 (Phase 8)**: depende de US5 (necesita presupuestos COMPLETO)
- **US7 (Phase 9)**: depende de US5 (y US6 para los enlaces de PDF desde la lectura)
- **Polish (Phase 10)**: depende de todas las historias deseadas

### User Story Dependencies

- **US1 (P1)**: independiente tras Foundational
- **US2 (P1)**: independiente tras Foundational
- **US3 (P1)**: independiente tras Foundational (su prueba `deleteClient` inserta borradores directamente en `quotes`)
- **US4 (P2)**: independiente tras Foundational; se ubica antes de US5 por ser insumo de las líneas del catálogo
- **US5 (P1)**: integra US2, US3 y US4
- **US6 (P1)**: integra US5
- **US7 (P2)**: integra US5 y US6

### Within Each User Story

- Las pruebas (T017, T023, T027, T030, T033, T034, T043, T044) se escriben primero y deben FALLAR antes de la implementación
- Dominio → repositorio → pantalla
- Las tareas que editan el mismo archivo (`QuoteEditor.tsx`: T036–T042, T049, T052–T054; `QuotesList.tsx`: T050–T051; `App.tsx`: T014, T020, T021) son secuenciales, no [P]

### Parallel Opportunities

- Setup: T003, T004, T005, T006 en paralelo tras T001–T002
- Foundational: T008, T009, T013 en paralelo; T015 y T016 en paralelo tras sus módulos
- Tras Foundational: US1, US2, US3 y US4 en paralelo entre equipos
- US5: T033 y T034 en paralelo; US6: T043, T044, T046, T047 en paralelo

---

## Parallel Example: User Story 5

```bash
# Pruebas de almacenamiento de US5 en paralelo (archivos distintos):
Task: "Crear tests/storage/quotes-repo-draft.test.ts (T033)"
Task: "Crear tests/storage/quotes-repo-complete.test.ts (T034)"

# Pantallas de US6 en paralelo una vez exista quote-document.ts:
Task: "Crear src/document/preview.tsx (T046)"
Task: "Crear src/document/pdf.ts (T047)"
```

---

## Implementation Strategy

### MVP First

1. Fase 1 Setup → Fase 2 Foundational
2. US1 (app estable y sin conexión) + US2 (perfil) + US3 (clientes) + US4 (catálogo)
3. US5 (borrador y completar) → US6 (PDF): aquí se alcanza el valor central del producto (SC-001, SC-002, SC-007)
4. **PARAR y VALIDAR** con quickstart §3 escenarios A–H
5. US7 (listado, eliminar borrador, aviso de cambios) y Polish

> Nota: las historias estrictamente "P1" son US1, US2, US3, US5 y US6; US4 y US7 son P2. El mínimo entregable de extremo a extremo exige US1+US2+US3+US5+US6, y US4 se adelanta porque US5 reutiliza su repositorio; si se quisiera posponerla, bastaría recortar las tareas T031–T032 y los botones de catálogo de T038 (los conceptos manuales siguen siendo posibles sin catálogo, según la spec).

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1–US4 → datos maestros funcionando
3. US5 → presupuestos completos (demo parcial)
4. US6 → PDF (MVP real)
5. US7 → comodidad de uso
6. Polish → verificación final

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- La etiqueta [Story] mapea cada tarea a su historia para trazabilidad
- Confirmar que las pruebas fallan antes de implementar
- Detenerse en cada checkpoint para validar la historia de forma independiente
- Propuestas fuera de la v1 (NO construir): botón "Quitar logo", aviso de instalación en iPhone/Safari, texto de ayuda sobre consultar al contador
- Evitar: tareas vagas, conflictos de archivo y dependencias entre historias que rompan su independencia
