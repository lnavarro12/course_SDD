# Implementation Plan: PresupuestosPro — Página de inicio, navegación común y rediseño visual

**Branch**: `002-presentacion-profesional` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-presentacion-profesional/spec.md`

## Summary

Cambio exclusivamente de **presentación** sobre la app de la spec 001. Se añade una pantalla de inicio en la dirección raíz, se unifican los nombres de sección (Presupuestos, Clientes, Catálogo, Perfil) y se rediseña el aspecto de la app y del PDF a partir de **un único sistema visual**:

- Todos los valores visuales (colores, tipografía, espaciado, radios, estados) se definen como **variables CSS en `:root` de [src/styles.css](../../src/styles.css)**. Las pantallas solo usan esas variables.
- El PDF toma sus colores de esas mismas variables al descargarse (lectura en el navegador), sin duplicar valores.
- Sin dependencias nuevas, sin fuentes descargadas, sin cambios en reglas, cálculos, almacenamiento ni datos.

El stack, las convenciones y la estructura del proyecto son los de [001/plan.md](../001-presupuestos-pdf/plan.md) y [001/data-model.md](../001-presupuestos-pdf/data-model.md); no se repiten ni se alteran aquí.

## Technical Context

**Language/Version**: igual que 001 (TypeScript 5.x, React 18, Vite; resultado estático)

**Primary Dependencies**: las de 001. **Ninguna nueva.** `pdfmake` conserva su fuente Roboto incluida; la app usa la pila de fuentes del sistema (sin descargas, funciona sin conexión)

**Storage**: sin cambios. El inicio solo **lee** presupuestos con `listQuotes()` ya existente; no escribe ni cambia el esquema

**Testing**: Vitest como en 001 (ajustes mínimos y una prueba nueva del conteo, ver abajo) + verificación manual con [quickstart.md](quickstart.md)

**Target Platform / Project Type**: igual que 001

**Performance Goals**: el inicio muestra su resumen en < 1 s con miles de presupuestos (un solo recorrido de lectura)

**Constraints**: mobile-first desde 360 px sin desplazamiento horizontal de página; contraste de texto ≥ 4,5:1; controles táctiles ≥ 44 px; sin conexión tras la primera carga; `domain/` y `storage/` sin cambios de lógica

**Scale/Scope**: +1 pantalla (Inicio), ajustes de estilo en las 7 existentes y en la plantilla del PDF

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|---|---|---|
| I. Simplicidad ante todo | Un solo archivo de estilos con variables; sin librerías de UI, de iconos ni de temas; sin dependencias nuevas. Un único archivo pequeño nuevo de código compartido (`sections.ts`, ver Complexity Tracking). | ✅ Pasa |
| II. Idioma y mercado | Todo el texto nuevo en español de Colombia; formatos COP y `DD/MM/AAAA` intactos. | ✅ Pasa |
| III. Cero alcance fantasma | Cada cambio se traza a un FR de la spec 002 (tabla en [research.md](research.md)). No se crean estados nuevos (decisión de clarificación). Sin modo oscuro ni selector de tema. | ✅ Pasa |
| IV. Verificable por una persona no técnica | Todos los criterios SC-001 a SC-009 se comprueban mirando la app y el PDF; [quickstart.md](quickstart.md) los lista como pasos observables. | ✅ Pasa |
| V. Datos del usuario con respeto | No se piden, guardan ni envían datos nuevos; sin servicios externos (fuentes locales). | ✅ Pasa |

**Re-evaluación tras el diseño (Phase 1)**: sin cambios. Una excepción justificada está en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-presentacion-profesional/
├── plan.md
├── research.md
├── data-model.md                 # Sin cambios de datos (lo declara)
├── quickstart.md
├── contracts/
│   ├── pantallas-y-rutas.md      # Cambios sobre el contrato de 001 (rutas y nombres)
│   └── sistema-visual.md         # Variables visuales y estados
└── tasks.md                      # Lo genera /speckit-tasks
```

### Source Code (cambios sobre la estructura de 001)

```text
src/
├── app/
│   ├── App.tsx            # MODIFICA: ruta "/" → Home; listado en "/presupuestos"; usa SECTIONS
│   ├── sections.ts        # NUEVO: nombres y direcciones de sección (nav e inicio comparten)
│   └── messages.ts        # MODIFICA solo textos que nombran secciones (si aplica)
├── domain/
│   └── quote-rules.ts     # MODIFICA solo un texto: "…en Configuración" → "…en Perfil" (sin lógica)
├── document/
│   ├── preview.tsx        # MODIFICA: clases/estructura de estilo, mismo contenido
│   └── pdf.ts             # MODIFICA: estilo de la plantilla; recibe un tema de colores
├── screens/
│   ├── Home.tsx           # NUEVO: inicio con accesos y resumen
│   ├── home-summary.ts    # NUEVO: función pura countByStatus (conteo por estado)
│   ├── QuotesList.tsx     # MODIFICA: estilo y etiquetas de estado; nuevos enlaces internos
│   ├── QuoteEditor.tsx    # MODIFICA: estilo y enlaces a "/presupuestos"
│   ├── QuotePreview.tsx   # MODIFICA: estilo; "volver" apunta a la nueva dirección
│   ├── Clients.tsx        # MODIFICA: estilo
│   ├── Services.tsx       # MODIFICA: estilo y título "Catálogo"
│   ├── Settings.tsx       # MODIFICA: estilo y título "Perfil"
│   └── AlreadyOpen.tsx    # MODIFICA: estilo
├── styles.css             # REESCRIBE: sistema visual en variables CSS + componentes
index.html / vite.config.ts  # SIN CAMBIO (el color principal se conserva, ver research.md)
tests/
├── document/preview-pdf-same-model.test.ts   # AJUSTA: pasa un tema al construir el PDF
├── domain/dates-rules.test.ts                # AJUSTA: texto "Perfil"
├── storage/quotes-repo-complete.test.ts      # AJUSTA: texto "Perfil"
└── screens/home-summary.test.ts              # NUEVO: conteo por estado
```

**Structure Decision**: se mantiene el proyecto único de 001. `domain/` y `storage/` no se tocan salvo el texto de un mensaje. No hay carpetas nuevas salvo `tests/screens/`.

## Complexity Tracking

| Elemento | Requisito | Por qué no basta lo más simple |
|---|---|---|
| `src/app/sections.ts` | FR-002 | Los nombres de sección deben ser idénticos en la navegación común y en los accesos del inicio; una sola lista evita que diverjan |
| Cambio de texto en `src/domain/quote-rules.ts` | FR-002 | El mensaje de validación nombra la sección ("…en Configuración"); si no cambia a "Perfil", la app mostraría dos nombres para lo mismo. Es solo texto: reglas y condiciones no cambian. Se ajustan los dos tests que comparan ese texto |
| PDF lee las variables CSS al descargar | FR-017, SC-009 | Duplicar los colores en un módulo TypeScript crearía dos lugares que mantener; leerlos de `styles.css` mantiene uno solo |
