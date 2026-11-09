# Contrato de pantallas y rutas — cambios sobre la spec 001

Base: [001/contracts/pantallas-y-rutas.md](../../001-presupuestos-pdf/contracts/pantallas-y-rutas.md). Solo se listan las diferencias; todo lo demás (acciones, mensajes, formatos) sigue igual.

## Direcciones

| Dirección | Pantalla | Cambio |
|---|---|---|
| `#/` | **Inicio** | **Nueva.** Antes mostraba el listado |
| `#/presupuestos` | Listado de presupuestos | **Nueva dirección** del listado (mismo contenido y acciones) |
| `#/presupuestos/nuevo` | Editor (nuevo) | Sin cambio |
| `#/presupuestos/:id` | Editor o lectura | Sin cambio |
| `#/presupuestos/:id/vista` | Vista previa | Sin cambio |
| `#/clientes` | Clientes | Sin cambio |
| `#/servicios` | **Catálogo** | Misma dirección; cambia el nombre visible |
| `#/configuracion` | **Perfil** | Misma dirección; cambia el nombre visible |
| (pestaña duplicada) | Aviso | Sin cambio de comportamiento; nuevo estilo |

Todo enlace interno que antes apuntaba a `#/` para volver al listado (tras eliminar, completar o desde la vista previa) pasa a apuntar a `#/presupuestos`.

## Navegación común (todas las pantallas excepto el aviso de pestaña duplicada)

Orden y nombres exactos, en una única lista compartida con el inicio:

| Texto | Dirección |
|---|---|
| Inicio | `#/` |
| Presupuestos | `#/presupuestos` |
| Clientes | `#/clientes` |
| Catálogo | `#/servicios` |
| Perfil | `#/configuracion` |

- Resalta la sección actual; "Presupuestos" queda activa en `#/presupuestos`, `#/presupuestos/nuevo`, `#/presupuestos/:id` y `#/presupuestos/:id/vista`.
- Sus enlaces respetan el aviso de cambios sin guardar de 001.

## Pantalla de inicio

Contenido, en este orden:
1. Título de bienvenida **PresupuestosPro**.
2. **Resumen de actividad**: Borradores, Completos y Total (números; cero si no hay datos).
3. Botón **Nuevo presupuesto** (enlaza a `#/presupuestos/nuevo`), destacado cuando el total es cero.
4. Cuatro accesos: Presupuestos, Clientes, Catálogo, Perfil, cada uno con una frase corta de qué contiene.

## Textos que cambian

| Antes | Ahora |
|---|---|
| Título "Servicios" | "Catálogo" |
| Título "Configuración" | "Perfil" (la subsección "Configuración fiscal" conserva su nombre) |
| "Configuración guardada." | "Perfil guardado." |
| "Completa tu nombre y NIT/CC en Configuración." | "Completa tu nombre y NIT/CC en Perfil." |
