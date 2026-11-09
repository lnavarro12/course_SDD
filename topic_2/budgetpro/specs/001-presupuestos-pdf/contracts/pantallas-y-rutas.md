# Contrato de pantallas y rutas

La aplicación no expone servicios externos. Su "interfaz" es lo que el usuario ve y hace. Este contrato fija las direcciones, las acciones de cada pantalla y los mensajes clave (en español de Colombia). Referencias: [spec.md](../spec.md), [data-model.md](../data-model.md).

## Direcciones (por `#`)

| Dirección | Pantalla | Comportamiento |
|---|---|---|
| `#/` | Listado de presupuestos | Filas con estado, número/fecha (completos), fecha de última modificación (borradores), cliente y total cuando existan. Mensaje si está vacío. Botón **Nuevo presupuesto** |
| `#/presupuestos/nuevo` | Editor (presupuesto nuevo, aún no guardado) | Acciones **Guardar borrador** y **Guardar presupuesto** |
| `#/presupuestos/:id` | Editor o lectura **según el estado** | BORRADOR → editable con los dos botones y **Eliminar borrador**. COMPLETO → solo lectura, sin botones de guardado ni de eliminar, con **Vista previa** y **Descargar PDF**. Si el id no existe: "Este presupuesto no está disponible." |
| `#/presupuestos/:id/vista` | Vista previa | Solo COMPLETO. Si es BORRADOR muestra el bloqueo (ver mensajes) |
| `#/clientes` | Clientes | Listar, crear, editar, eliminar |
| `#/servicios` | Catálogo de servicios | Listar, crear, editar, eliminar |
| `#/configuracion` | Perfil y configuración fiscal | Datos profesionales, logo, retención (IVA visible y fijo) |
| (cualquiera, si otra pestaña ya la tiene abierta) | Aviso de pestaña duplicada | Sin edición posible |

La regla "un presupuesto COMPLETO nunca se edita" aplica a **la misma dirección** `#/presupuestos/:id`: no existe una dirección de edición aparte que pueda abrirse para un completo.

## Acciones del editor de presupuesto

| Acción | Disponible en | Resultado |
|---|---|---|
| Elegir/cambiar cliente, o crear uno nuevo en el momento | BORRADOR | Se toman los datos del cliente; retención reevaluada; si no hay cliente, aviso en retención y total |
| Agregar línea del catálogo | BORRADOR | Carga descripción y precio; un servicio ya presente se bloquea con aviso |
| Agregar concepto manual | BORRADOR | Ofrece guardarlo en el catálogo (código único) |
| Modificar / eliminar línea | BORRADOR | Recalcula al instante |
| **Guardar borrador** | Nuevo y BORRADOR | Guarda lo que haya (aunque esté incompleto); confirma; sigue en BORRADOR; sin número ni fechas |
| **Guardar presupuesto** | Nuevo y BORRADOR | Valida → si hay errores los lista y no cambia nada → si todo bien, pide confirmación → al confirmar, completa (todo o nada) |
| **Eliminar borrador** | BORRADOR guardado | Pide confirmación; definitiva |
| **Vista previa** / **Descargar PDF** | COMPLETO | Muestran el documento; descargar no cambia el presupuesto |

## Mensajes clave

| Situación | Mensaje |
|---|---|
| Guardar borrador correcto | "Borrador guardado." |
| Valor no numérico en cantidad o precio (borrador) | "La cantidad debe ser un número." / "El precio debe ser un número." |
| Sin cliente (resumen del borrador) | "Selecciona un cliente para calcular la retención y el total." |
| Completar con errores | "No se puede guardar el presupuesto. Corrige lo siguiente:" + lista (p. ej. "Selecciona un cliente.", "Agrega al menos una línea.", "La línea 2 necesita una descripción.", "La cantidad de la línea 3 debe ser mayor que cero.", "El precio de la línea 1 no puede ser negativo.", "Completa tu nombre y NIT/CC en Configuración.") |
| Confirmar completar | "Al guardar el presupuesto quedará definitivo: no podrás modificarlo. ¿Deseas continuar?" |
| Completar con éxito | "Presupuesto guardado con el número {AAAA-NNN}." |
| Error de almacenamiento al completar | "No se pudo guardar el presupuesto. No se perdió ningún dato y sigue como borrador. Libera espacio en tu dispositivo e inténtalo de nuevo." |
| Vista previa / PDF de un borrador | "Primero debes guardar el presupuesto como definitivo para verlo o descargarlo." |
| Servicio ya en el presupuesto | "Este servicio ya está en el presupuesto." |
| Código de servicio repetido | "Ya existe un servicio con ese código." |
| NIT/CC repetido en clientes | "Ya tienes un cliente con este NIT/CC. ¿Guardar de todos modos?" |
| Logo no válido | "El logo debe ser una imagen PNG o JPG de hasta 2 MB." |
| Precio del catálogo cambió (borrador) | "El precio de «{servicio}» cambió en el catálogo (antes {precio}, ahora {precio}). La línea conserva el precio con el que la agregaste." |
| Eliminar borrador | "Se eliminará este borrador de forma definitiva. ¿Deseas continuar?" |
| Cambios sin guardar al salir | "Tienes cambios sin guardar en este borrador. Si sales, se perderán." |
| Pestaña duplicada | "PresupuestosPro ya está abierta en otra pestaña o ventana. Ciérrala o úsala allí; aquí no se puede editar." |
| Almacenamiento no disponible | "No se puede guardar información en este navegador. Revisa que no estés en modo privado y que haya espacio disponible." |
| Falla al generar PDF | "No se pudo generar el PDF. Inténtalo de nuevo; si continúa, cierra y vuelve a abrir la aplicación." |

## Formatos

- Importes: `$1.234.567` (pesos enteros, punto como separador de miles).
- Fechas: `DD/MM/AAAA`.
- Estados en el listado: etiquetas **BORRADOR** y **COMPLETO**.
- Nombre del archivo descargado: `PRESUPUESTO-AAAA-NNN.pdf`.
