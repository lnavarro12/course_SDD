# Quickstart de validación: Inicio, navegación y rediseño

Prerrequisitos y arranque iguales a [001/quickstart.md](../001-presupuestos-pdf/quickstart.md): `npm install`, `npm run dev` y abrir http://localhost:5173/. Pruebas automáticas: `npm test`. Verificación de tipos y compilación: `npm run build`.

Para las pruebas de pantalla pequeña, usar el modo móvil del navegador con ancho de 360 px. Preparar al menos 1 borrador, 1 presupuesto completo, 1 cliente y 1 servicio (o empezar sin datos para los escenarios vacíos).

## Escenarios (se comprueban mirando la app y el PDF)

| # | Pasos | Resultado esperado | Criterio |
|---|---|---|---|
| 1 | Abrir `http://localhost:5173/` | Aparece el **Inicio** con el resumen y cuatro accesos: Presupuestos, Clientes, Catálogo, Perfil | SC-001 |
| 2 | Con datos: contar borradores y completos en el listado y compararlos con el resumen | Los números coinciden | SC-003 |
| 3 | Sin datos (navegador nuevo o datos borrados): abrir el inicio | Resumen en cero y botón **Nuevo presupuesto** destacado | FR-004 |
| 4 | Desde cada pantalla (inicio, listado, nuevo presupuesto, editor, vista previa, clientes, catálogo, perfil) pulsar cada elemento de la barra | Se llega a las cinco secciones en un toque, sin usar el botón atrás; la sección actual se ve resaltada | SC-002 |
| 5 | Editar un borrador sin guardar y pulsar un elemento de la barra | Aparece la advertencia de cambios sin guardar | FR-006 |
| 6 | Abrir directamente `#/presupuestos/<id>`, `#/clientes`, `#/servicios`, `#/configuracion` | Cada una abre su pantalla como antes | FR-008 |
| 7 | Revisar los nombres en la barra, el inicio y los títulos | Siempre "Catálogo" y "Perfil"; ningún "Servicios" ni "Configuración" como nombre de sección (la subsección "Configuración fiscal" sí permanece) | FR-002 |
| 8 | Completar un presupuesto sin tener nombre y NIT/CC en el perfil | El error dice "…en Perfil." | FR-002 |
| 9 | Recorrer todas las pantallas | Misma tipografía, colores y espaciado; títulos > tablas/formularios > notas; totales destacados | SC-004 |
| 10 | Mirar el listado, un borrador, un completo y el inicio | BORRADOR (borde punteado) y COMPLETO (relleno) se reconocen de un vistazo, también en escala de grises | SC-005 |
| 11 | Repetir 4, 9 y 10 a 360 px | Sin desplazamiento horizontal de la página; barra y botones utilizables | SC-006 |
| 12 | Cambiar `--c-primary` en `styles.css` y recargar | El color cambia en toda la app (el PDF usa el nuevo al volver a descargar) | SC-009 |
| 13 | Descargar el PDF de un completo y compararlo con uno anterior (si existe) o con el contrato del documento | Mismos textos, importes, fechas y nombre de archivo; nuevo estilo con jerarquía clara | SC-007 |
| 14 | Descargar un PDF con muchas líneas y otro sin logo | Varias páginas legibles / documento equilibrado sin logo | FR-017 |
| 15 | Repetir los flujos de 001 (crear, guardar borrador, completar, previsualizar, descargar, clientes, catálogo) | Resultados idénticos a antes | SC-008 |
| 16 | Abrir la app en una segunda pestaña | Aviso de pestaña duplicada con el nuevo estilo | Edge case |
| 17 | Crear un cliente con nombre de 80 caracteres y una línea con descripción de 200 caracteres con tildes y ñ; verlos en la app y descargar el PDF | Sin desbordes ni cortes; tildes y ñ correctas en la app y en el PDF | Edge case |

## Pruebas automáticas esperadas

- Todas las pruebas de 001 siguen pasando (con los dos textos "Perfil" ajustados y el tema pasado a `buildPdfDefinition`).
- Nueva prueba del conteo por estado del inicio.
- La prueba "vista previa y PDF salen del mismo modelo" sigue pasando.
