# Research & Decisiones: PresupuestosPro

Cada decisión sigue el formato **Decisión → Por qué (negocio) → Alternativas descartadas**. No quedan puntos "por aclarar" del plan.

## 1. Todo vive en el dispositivo del usuario (sin servidor, sin nube)

- **Decisión**: la aplicación es una carpeta de archivos web. Los datos (perfil, clientes, servicios, presupuestos) se guardan en el navegador del usuario y el PDF se genera allí.
- **Por qué (negocio)**: es lo más simple y barato posible. No hay servidor que mantener, nada que pagar al crecer, ningún dato del cliente viaja por Internet (más privacidad) y funciona sin conexión. Cumple directamente la spec (sin cuentas, sin nube, uso individual).
- **Alternativas descartadas**: backend con base de datos y cuentas (cuesta tiempo y dinero, exige seguridad y soporte que la v1 no necesita); servicios "backend como servicio" tipo Firebase (introducen cuentas y claves, contra el Principio V y la spec).

## 2. Publicación: sitio estático en un hosting gratuito

- **Decisión**: se genera una carpeta (`dist`) y se publica en un hosting estático gratuito. **Recomendación: Netlify**, donde basta con arrastrar la carpeta, sin necesidad de Git ni de configurar nada. Cloudflare Pages y Vercel funcionan igual.
- **Por qué (negocio)**: "publicable enseguida" significa un solo paso manual. Da una dirección con HTTPS, que además es obligatoria para el funcionamiento sin conexión y la instalación en el móvil.
- **Alternativas descartadas**: servidor propio o contenedor (innecesario); GitHub Pages (exige repositorio y rama de publicación; es válido pero más pasos).

## 3. Interfaz: React + TypeScript + Vite, un solo proyecto

- **Decisión**: React para las pantallas, TypeScript para evitar errores en los cálculos de dinero, Vite para construir.
- **Por qué (negocio)**: son herramientas muy extendidas, con mucha documentación y fácil de mantener o transferir a otra persona. Los formularios con listas y totales recalculados al instante (SC-003) son justo lo que React resuelve bien.
- **Alternativas descartadas**: JavaScript sin librería (más código a mano y más errores en pantallas con muchas interacciones); Next.js u otro framework con servidor (añade infraestructura que no hace falta).

## 4. Navegación con direcciones tipo `#/presupuestos/123`

- **Decisión**: las pantallas se identifican con `#` en la dirección.
- **Por qué (negocio)**: el spec pide que un presupuesto completo no se pueda editar ni "entrando por su dirección" (FR-034). Con direcciones por `#` toda la navegación funciona en cualquier hosting estático sin configuración, y esa dirección queda cubierta por la regla de solo lectura.
- **Alternativas descartadas**: direcciones "limpias" (exigen configurar redirecciones en el hosting; riesgo de pantallas en blanco al recargar).

## 5. Almacenamiento: IndexedDB (no localStorage)

- **Decisión**: IndexedDB, con el envoltorio mínimo `idb`.
- **Por qué (negocio)**:
  1. **Completar es "todo o nada"**: asignar número, fechas, estado y copias consolidadas ocurre en una sola operación. Si algo falla o se cierra el navegador a medias, no queda un presupuesto a medio completar ni un número gastado (FR-033, SC-017).
  2. **Numeración sin duplicados**: el contador anual se actualiza en esa misma operación.
  3. **Espacio suficiente**: localStorage da ~5 MB; con logos y cientos de presupuestos se llenaría.
- **Alternativas descartadas**: localStorage (sin operaciones atómicas, poco espacio); SQLite en el navegador (más pesado y complejo para este volumen).

## 6. Dinero exacto con enteros

- **Decisión**: los importes se guardan como **pesos enteros** y las cantidades como **centésimas** (1,5 horas = 150). IVA y retención se calculan con aritmética de enteros y redondeo "medio hacia arriba" al peso.
- **Por qué (negocio)**: elimina los errores de céntimos de los números decimales normales; los ejemplos del spec ($670.000 → IVA $127.300 → total $723.600) salen exactos siempre (FR-027, SC-002). No requiere librería extra.
- **Alternativas descartadas**: números decimales de JavaScript (errores de redondeo); librerías de decimales (dependencia innecesaria para pesos enteros).

## 7. Una sola pestaña a la vez

- **Decisión**: al abrirse, la app pide al navegador un "turno exclusivo" (API Web Locks). Si ya lo tiene otra pestaña, la nueva muestra un aviso y no permite editar.
- **Por qué (negocio)**: evita dos pestañas guardando a la vez y, con ello, números repetidos o cambios pisados (FR-006). Es una solución del propio navegador, sin código de sincronización.
- **Alternativas descartadas**: mensajes entre pestañas con reglas propias (más código y casos raros); permitir varias pestañas y resolver conflictos (complejidad que el spec descartó).

## 8. Funciona sin Internet e instalable en el móvil

- **Decisión**: un "service worker" (con `vite-plugin-pwa`) guarda la aplicación en el dispositivo tras la primera carga. De paso se puede "añadir a la pantalla de inicio".
- **Por qué (negocio)**: es lo que hace posible FR-003 y SC-007 (crear y descargar sin conexión), y se ve como una app en el móvil. No hay nada más que configurar.
- **Alternativas descartadas**: depender de la conexión (incumple el spec); aplicación nativa de móvil (fuera de alcance, otro desarrollo y tiendas de apps).

## 9. PDF en el dispositivo; vista previa y PDF salen del mismo "modelo del documento"

- **Decisión**:
  - El PDF se genera con **pdfmake**, que reparte las tablas en varias páginas y ajusta textos largos solo, y soporta tildes y ñ (FR-042).
  - Un único modelo (`quote-document.ts`) arma el contenido del presupuesto ya formateado (textos, importes, fechas). La **vista previa en pantalla** y el **PDF** se dibujan a partir de ese mismo modelo.
  - El generador de PDF se descarga solo cuando el usuario pulsa Descargar, para que la app abra rápido.
- **Por qué (negocio)**: garantiza que lo que el profesional revisa es lo que recibe el cliente (FR-040, SC-010). Genera un archivo real con nombre `PRESUPUESTO-AAAA-NNN.pdf` en el móvil y el computador, sin enviar datos a ningún servidor.
- **Alternativas descartadas**: imprimir la página del navegador (el nombre del archivo y el diseño varían según el dispositivo; mal control del resultado en móvil); mostrar el PDF dentro de la pantalla como vista previa (en muchos móviles solo se ve la primera página); generar el PDF en un servidor (infraestructura y privacidad).

## 10. Logo reducido al subirlo

- **Decisión**: se aceptan PNG y JPG de hasta 2 MB (FR-008). Al subirlo, la app lo reduce a un máximo de 600 px de ancho antes de guardarlo.
- **Por qué (negocio)**: cada presupuesto completo guarda su propia copia del logo (FR-035). Un logo de 2 MB repetido en cientos de presupuestos llenaría el espacio del navegador; reducido pesa decenas de KB y se ve igual en el PDF. También resuelve el caso de "imagen demasiado grande" sin bloquear la app.
- **Alternativas descartadas**: guardar el original (consumo de espacio); un almacén aparte de logos compartidos (más complejidad para el mismo resultado).

## 11. Móvil primero con estilos propios

- **Decisión**: un único archivo de estilos, pensado desde 360 px de ancho: una columna, botones grandes, tablas que se convierten en tarjetas en pantallas pequeñas. Sin librería de componentes visuales.
- **Por qué (negocio)**: "funcionar bien en móvil" se logra mejor diseñando primero para móvil y ampliando a escritorio. Una librería de interfaz añade peso y decisiones que la v1 no necesita.
- **Alternativas descartadas**: librerías de componentes (Material, Bootstrap, etc.); una versión de escritorio y otra de móvil separadas.

## 12. Fechas con la hora de Colombia

- **Decisión**: la fecha de emisión (el día en que se completa) y el año de la numeración se calculan con la zona horaria de Colombia (America/Bogota); el vencimiento suma 30 días naturales.
- **Por qué (negocio)**: evita que un presupuesto completado a las 8 p. m. en Colombia salga con la fecha del día siguiente, o con el año equivocado el 31 de diciembre, si el dispositivo tuviera otra zona horaria.
- **Alternativas descartadas**: usar la fecha del dispositivo sin más (puede variar según el ajuste del equipo).

## 13. Pruebas

- **Decisión**: Vitest (con `fake-indexeddb`) para las reglas de dinero, los estados BORRADOR/COMPLETO, la numeración, la finalización fallida y el contenido del documento. Las pantallas las verifica una persona no técnica con el [quickstart](quickstart.md).
- **Por qué (negocio)**: las partes donde un error cuesta dinero (cálculos, números, inmutabilidad) quedan protegidas automáticamente; la aceptación final la hace quien usa el producto (Principio IV).
- **Alternativas descartadas**: pruebas de navegador automáticas con Playwright (útiles más adelante, pero añaden herramientas y mantenimiento que la v1 no necesita).

## 14. Pedir almacenamiento "persistente"

- **Decisión**: al iniciar, la app pide al navegador que no borre sus datos automáticamente (`navigator.storage.persist()`), sin interrumpir al usuario.
- **Por qué (negocio)**: es una línea de código que reduce el riesgo de perder datos por limpieza automática (FR-002). No agrega ninguna función visible.
- **Alternativas descartadas**: no hacer nada (más riesgo, mismo esfuerzo); pedir al usuario un respaldo manual (fuera de alcance).

## Riesgos y puntos a tener presentes

1. **Datos solo en el dispositivo**. Si el usuario borra los datos del navegador, cambia de equipo o el navegador los limpia, pierde la información; la v1 no tiene respaldo (así lo dice el spec).
2. **iPhone/Safari**: Safari puede borrar los datos de sitios web que no se usan en 7 días, salvo que la app esté **añadida a la pantalla de inicio**. Recomendación para el usuario con iPhone: instalarla (la app puede explicarlo en la configuración). Si esto es un riesgo importante para el negocio, la solución sería una función de respaldo, que **hoy no está en la spec** y se propone para una versión futura.
3. **Descarga del PDF en iPhone**: Safari suele abrir el PDF en un visor con la opción de compartir o guardar, en vez de bajarlo directamente. Es un comportamiento del sistema; el archivo se conserva con su nombre.
4. **Navegadores muy antiguos** (anteriores a Safari 15.4 o similares) no soportan el turno exclusivo entre pestañas; se asume navegador actualizado.

## Trazabilidad requisito → pieza del plan

| Requisitos del spec | Pieza |
|---|---|
| FR-001, FR-003 | Sitio estático + service worker; sin cuentas |
| FR-002, FR-017 a FR-021, FR-033, FR-034 | `storage/` (IndexedDB, transacción única), `domain/quote-rules.ts` |
| FR-004 | Mensajes definidos en `contracts/pantallas-y-rutas.md` |
| FR-005, FR-006 | Aviso de cambios sin guardar; `app/tab-lock.ts` |
| FR-007 a FR-010 | `Settings.tsx`, `profile-repo.ts`, reducción del logo |
| FR-011 a FR-014 | `Clients.tsx`, `clients-repo.ts` |
| FR-015, FR-016 | `Services.tsx`, `services-repo.ts` |
| FR-022 a FR-028 | `QuoteEditor.tsx`, `domain/calc.ts`, `domain/money.ts` |
| FR-029 a FR-035 | `quotes-repo.ts` (completar), `domain/dates.ts` |
| FR-036 a FR-038 | `QuotesList.tsx` |
| FR-039 a FR-044 | `document/` (modelo, vista previa, PDF) |
