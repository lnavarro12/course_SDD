# Estado del producto — PresupuestosPro

Índice de specs y su avance. Las reglas de producto están en `.specify/memory/constitution.md`; el stack y las convenciones, en `CLAUDE.md`.

| Spec | Qué entrega | Tareas | Pendiente |
|---|---|---|---|
| [001-presupuestos-pdf](001-presupuestos-pdf/spec.md) | Perfil, clientes, catálogo, presupuestos (borrador/completo), vista previa y PDF, offline, una sola pestaña | 58 de 60 | T056 revisión a 360 px; T059 verificación final con `quickstart.md` (escenarios A–H, sin conexión, SC-002/003/007) |
| [002-presentacion-profesional](002-presentacion-profesional/spec.md) | Página de inicio, navegación común y rediseño visual (app y PDF) sobre un único sistema de variables CSS | 22 de 23 | T022 recorrido de `quickstart.md` (escenarios 1–17) |

Las dos specs figuran como *Draft* en su cabecera, aunque el código está casi completo.

## Fuera de alcance vigente
- Facturación electrónica, ReteIVA/ReteICA, envío de correos, cuentas, nube/respaldos, multi-moneda/idioma/país, editor de plantillas.
- Estados distintos de BORRADOR y COMPLETO; anular o eliminar presupuestos completos.
- Reportes, búsqueda, filtros, modo oscuro, personalización de tema.

## Propuestas para versiones futuras
- Duplicar un presupuesto como borrador y anular (spec 001).
- Estados enviado/aceptado/rechazado/caducado (spec 002).
- Numeración de páginas, pies y marcas de agua en el PDF (spec 002).
- Respaldo/exportación de datos (plan 001).

## Cómo mantener este archivo
Actualizarlo al cerrar tareas o crear una spec nueva (una fila por spec).
