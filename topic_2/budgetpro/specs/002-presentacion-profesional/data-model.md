# Modelo de datos: sin cambios

Esta mejora **no modifica** el modelo de datos de [001/data-model.md](../001-presupuestos-pdf/data-model.md): mismos almacenes, entidades, campos, estados (solo BORRADOR y COMPLETO) y versión de la base local. No hay migración.

## Dato derivado (no almacenado)

**Resumen de actividad** — calculado al abrir el inicio a partir de los presupuestos guardados:

| Valor | Cómo se obtiene |
|---|---|
| Borradores | Cantidad de presupuestos con estado BORRADOR |
| Completos | Cantidad de presupuestos con estado COMPLETO |
| Total | Borradores + Completos |

Debe coincidir siempre con las filas del listado de presupuestos (SC-003).
