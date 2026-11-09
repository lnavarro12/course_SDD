# Implementation Plan: PresupuestosPro — Presupuestos profesionales en PDF

**Branch**: `001-presupuestos-pdf` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-presupuestos-pdf/spec.md`

## Summary

PresupuestosPro es una **aplicación web estática que vive entera en el dispositivo del profesional**: no hay servidor propio, ni cuentas, ni base de datos en la nube. Se publica como una carpeta de archivos en un hosting gratuito, se abre desde el navegador del móvil o del computador, guarda sus datos en el propio navegador y genera el PDF allí mismo. Una vez cargada, funciona sin Internet.

Enfoque técnico (las razones, en lenguaje de negocio, están en [research.md](research.md)):

- Interfaz **móvil primero** con React + TypeScript + Vite, un solo proyecto.
- Datos locales en **IndexedDB**, que permite completar un presupuesto "todo o nada" y numerar sin duplicados.
- Dinero en **pesos enteros** y cantidades en centésimas: cálculo exacto sin librerías de decimales.
- Vista previa y PDF salen de **un único modelo del documento**, para que siempre muestren lo mismo.
- **Una sola pestaña** a la vez mediante un bloqueo del navegador; funcionamiento sin conexión con un service worker.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 20 LTS (solo para construir; el resultado final es HTML/JS/CSS estático)

**Primary Dependencies**: React 18, Vite, `idb` (envoltorio mínimo de IndexedDB), `pdfmake` (PDF en el dispositivo, se carga solo al descargar), `vite-plugin-pwa` (funcionamiento sin conexión), `wouter` (navegación por `#`)

**Storage**: IndexedDB del navegador (almacenes: perfil, configuración, clientes, servicios, presupuestos, contadores anuales). Sin servidor ni nube.

**Testing**: Vitest + `fake-indexeddb` para reglas de negocio, almacenamiento y modelo del documento; verificación de pantallas siguiendo [quickstart.md](quickstart.md), hecha por una persona no técnica

**Target Platform**: navegadores modernos en móvil y escritorio (Chrome, Edge, Firefox, Safari 15.4+); publicada como sitio estático (HTTPS)

**Project Type**: aplicación web de una sola página (single project, solo frontend)

**Performance Goals**: cálculos y recálculo de totales instantáneos (< 1 s, SC-003); generar un PDF de varias páginas en pocos segundos; carga inicial ligera (el generador de PDF se descarga solo al usarlo)

**Constraints**: sin conexión tras la primera carga; sin secretos ni variables de entorno; una sola pestaña editando; pantallas usables desde 360 px de ancho; datos solo en el dispositivo

**Scale/Scope**: un usuario, cientos de clientes/servicios y algunos miles de presupuestos como máximo; 7 pantallas (listado, editor/lectura de presupuesto, vista previa, clientes, servicios, configuración, aviso de pestaña duplicada)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|---|---|---|
| I. Simplicidad ante todo | Un solo proyecto, sin servidor, sin cuentas, sin capas "por si acaso". Cinco dependencias de ejecución, cada una con una razón concreta de la spec (ver research.md). Los cálculos usan aritmética de enteros en vez de una librería. | ✅ Pasa |
| II. Idioma y mercado | Interfaz y PDF en español de Colombia; importes en COP con formato `$1.234.567`; IVA 19 % y retención en la fuente; NIT/CC; fechas `DD/MM/AAAA` con hora de Colombia. Sin selector de idioma, moneda ni país. | ✅ Pasa |
| III. Cero alcance fantasma | Cada módulo del plan se traza a un requisito FR del spec (tabla en data-model.md y research.md). Las ideas no incluidas (respaldo/exportación, duplicar, anular) quedan como propuestas, no como diseño. | ✅ Pasa |
| IV. Verificable por una persona no técnica | Todos los criterios se comprueban en la app o en el PDF; el quickstart los lista como pasos observables. Las pruebas automáticas son una ayuda adicional, no el criterio de aceptación. | ✅ Pasa |
| V. Datos del usuario con respeto | Los datos nunca salen del dispositivo (no hay servidor ni analítica). El proyecto no necesita claves ni secretos; no se crea ningún archivo de entorno. | ✅ Pasa |

**Re-evaluación tras el diseño (Phase 1)**: sin cambios. El diseño no agregó nada que la spec no pida. Las dos piezas "técnicas" sin requisito visible, el service worker y la petición de almacenamiento persistente, existen únicamente para cumplir FR-003 (sin conexión) y FR-002 (conservar datos); están justificadas en research.md.

## Project Structure

### Documentation (this feature)

```text
specs/001-presupuestos-pdf/
├── plan.md              # Este archivo
├── research.md          # Decisiones y alternativas, en lenguaje de negocio
├── data-model.md        # Datos, estados y reglas de transición
├── quickstart.md        # Cómo arrancar, probar y publicar; escenarios de verificación
├── contracts/
│   ├── pantallas-y-rutas.md      # Direcciones, pantallas, acciones y mensajes
│   └── documento-presupuesto.md  # Contenido exacto de la vista previa y el PDF
└── tasks.md             # Lo genera /speckit-tasks (no existe todavía)
```

### Source Code (repository root)

```text
index.html
package.json
vite.config.ts            # incluye la configuración de funcionamiento sin conexión
tsconfig.json
public/
└── icons/                # iconos para instalar la app en el móvil
src/
├── main.tsx
├── app/
│   ├── App.tsx           # rutas y bloqueo de pestaña única
│   ├── tab-lock.ts
│   ├── messages.ts       # textos del contrato de pantallas y descripción de errores (FR-004)
│   ├── logo-resize.ts    # validación y reducción del logo (FR-008)
│   └── GuardedLink.tsx   # aviso de cambios sin guardar al navegar (FR-005)
├── domain/               # reglas puras, sin pantallas ni almacenamiento
│   ├── types.ts
│   ├── money.ts          # pesos enteros, redondeo, formato $1.234.567
│   ├── calc.ts           # importe de línea, base, IVA, retención, total
│   ├── quote-rules.ts    # validaciones de completar, "datos suficientes"
│   └── dates.ts          # fecha de emisión y vencimiento (hora de Colombia)
├── storage/
│   ├── db.ts             # apertura y versión de la base local
│   ├── profile-repo.ts
│   ├── clients-repo.ts
│   ├── services-repo.ts
│   └── quotes-repo.ts    # guardar borrador, completar (transacción única), eliminar borrador
├── document/
│   ├── quote-document.ts # modelo único del documento
│   ├── preview.tsx       # vista previa a partir del modelo
│   └── pdf.ts            # PDF a partir del mismo modelo
├── screens/
│   ├── QuotesList.tsx
│   ├── QuoteEditor.tsx   # edita borradores; muestra completos en solo lectura
│   ├── QuotePreview.tsx
│   ├── Clients.tsx
│   ├── Services.tsx
│   ├── Settings.tsx
│   └── AlreadyOpen.tsx
└── styles.css            # diseño móvil primero, un solo archivo
tests/
├── domain/
├── storage/
└── document/
```

**Structure Decision**: un único proyecto frontend. La carpeta `domain/` concentra todas las reglas del spec sin depender de pantallas ni del navegador, de modo que se prueban rápido y una regla cambia en un solo lugar. `storage/` es la única parte que conoce IndexedDB. `document/` es la única fuente del contenido del presupuesto. No hay `backend/`, `api/` ni carpeta de servicios.

## Complexity Tracking

Sin violaciones de la constitución. Tres archivos de apoyo en `src/app/` se justifican así (Principio I):

| Archivo | Requisito | Por qué no basta lo más simple |
|---|---|---|
| `messages.ts` | FR-004 | Los mismos mensajes del contrato se usan en varias pantallas; un solo lugar evita textos distintos para la misma situación |
| `logo-resize.ts` | FR-008 | Validar y reducir el logo es lógica de imagen que no pertenece a una pantalla y se reutiliza al guardar el perfil |
| `GuardedLink.tsx` | FR-005 | `wouter` en modo hash no ofrece bloqueo de navegación; es la forma mínima de avisar de cambios sin guardar |
