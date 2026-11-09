# PresupuestosPro

App web estática y offline para que freelancers colombianos creen presupuestos profesionales en PDF, con todos los datos guardados en el propio dispositivo.

## Stack (vigente)
- React 18 + TypeScript 5 + Vite, un solo proyecto frontend (sin servidor, cuentas ni nube); Node ≥ 20 solo para construir.
- Datos en IndexedDB vía `idb`; navegación por `#` con `wouter`.
- PDF con `pdfmake` (carga diferida, solo al descargar); offline con `vite-plugin-pwa` (service worker).
- Dinero en pesos enteros (COP) y cantidades en centésimas: sin librerías de decimales.
- Vista previa y PDF salen de un único modelo (`src/document/quote-document.ts`).
- Una sola pestaña editando a la vez (bloqueo del navegador, `src/app/tab-lock.ts`).
- Estilo: un único `src/styles.css` con variables CSS en `:root`; el PDF lee esas mismas variables. Fuentes del sistema, móvil primero (≥360 px).

## Estructura
`src/domain` reglas puras · `src/storage` único lugar que conoce IndexedDB · `src/document` modelo/preview/PDF · `src/screens` pantallas · `src/app` rutas y utilidades · `tests/` espeja `src/`.

## Arrancar y probar
- `npm install` · `npm run dev` (desarrollo) · `npm run build` (tsc + vite) · `npm run preview` (probar el build/offline).
- `npm test` (Vitest + `fake-indexeddb`). La verificación de pantallas sigue el `quickstart.md` de cada spec.

## Convenciones
- Todo texto visible (UI, errores, PDF) en español de Colombia; COP `$1.234.567`; fechas `DD/MM/AAAA` hora de Colombia; IVA 19 %, retención, NIT/CC.
- Flujo SDD: spec → plan → tasks → implement; nada de código sin requisito (FR) en la spec.
- Reglas de negocio en `domain/` (sin React ni navegador); mensajes de usuario centralizados en `app/messages.ts`.
- Sin secretos ni archivos de entorno; sin dependencias nuevas sin justificarlas en el plan.
- Ideas fuera de alcance se registran como propuestas, no como código.

Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md
