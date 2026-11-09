# Modelo de datos: PresupuestosPro

Todo se guarda en IndexedDB del navegador (una base local, sin servidor). Los importes son **pesos enteros**; las cantidades son **centésimas** (1,5 → `150`). Detalle de decisiones en [research.md](research.md).

## Almacenes

| Almacén | Clave | Contenido |
|---|---|---|
| `profile` | fija (`main`) | Perfil profesional (un solo registro) |
| `settings` | fija (`main`) | Configuración fiscal (un solo registro) |
| `clients` | `id` | Clientes |
| `services` | `id` (índice único en `codeKey`) | Catálogo |
| `quotes` | `id` (índice en `status`, `updatedAt`) | Presupuestos (borradores y completos) |
| `counters` | año (p. ej. `2026`) | Último número usado en ese año |

## Entidades

### Perfil profesional (`profile`) — FR-007, FR-008
| Campo | Tipo | Reglas |
|---|---|---|
| name | texto | Obligatorio |
| taxId | texto | Obligatorio (NIT/CC, texto libre) |
| email, phone, address | texto | Opcionales |
| logo | imagen (PNG/JPG reducida a ≤ 600 px) o vacío | Opcional; archivo de origen ≤ 2 MB |

### Configuración fiscal (`settings`) — FR-009, FR-010
| Campo | Tipo | Reglas |
|---|---|---|
| withholdingPct | 4, 6, 10 u 11 | Por defecto 11. Ningún otro valor se acepta |

El IVA (19 %) es una constante del producto, no un dato guardado ni editable.

### Cliente (`clients`) — FR-011 a FR-014
| Campo | Tipo | Reglas |
|---|---|---|
| id | identificador único | Generado al crear |
| name | texto | Obligatorio |
| type | `PERSONA_NATURAL` \| `EMPRESA` | Obligatorio |
| taxId | texto | Obligatorio si `EMPRESA`; si ya existe en otro cliente se advierte pero se permite |
| email, phone, address | texto | Opcionales |

### Servicio (`services`) — FR-015, FR-016
| Campo | Tipo | Reglas |
|---|---|---|
| id | identificador único | |
| code | texto | Obligatorio |
| codeKey | texto | `code` en minúsculas y sin espacios sobrantes; **único** (impide `LOGO-01` y `logo-01` a la vez) |
| description | texto | Obligatoria |
| price | entero ≥ 0 | Pesos |

### Presupuesto (`quotes`) — FR-017 a FR-035
Campos comunes:

| Campo | Tipo | Reglas |
|---|---|---|
| id | identificador único | Interno; distinto del número visible (FR-017) |
| status | `BORRADOR` \| `COMPLETO` | Nace en `BORRADOR` |
| createdAt, updatedAt | fecha-hora | `updatedAt` se muestra en el listado solo en borradores |
| lines | lista de **Línea** | Puede estar vacía en BORRADOR |

Solo en `BORRADOR`:

| Campo | Tipo | Reglas |
|---|---|---|
| clientId | id o vacío | El cliente se muestra con sus datos actuales; si el cliente se elimina, pasa a vacío (FR-014) |

Solo en `COMPLETO` (se escriben todos juntos al completar y no vuelven a cambiar):

| Campo | Tipo | Reglas |
|---|---|---|
| number | texto `AAAA-NNN` | Único; `NNN` con 3 dígitos como mínimo (999 → 1000 si algún año se superara) |
| issueDate | fecha `AAAA-MM-DD` | Día de finalización, hora de Colombia |
| dueDate | fecha | `issueDate` + 30 días naturales |
| issuer | copia del perfil | Nombre, NIT/CC, contacto, dirección, logo (FR-035) |
| client | copia del cliente | Nombre, tipo, NIT/CC, contacto |
| withholdingPctApplied | 0, 4, 6, 10 u 11 | 0 si el cliente es persona natural |
| totals | base, iva, withholding, total | Enteros |

### Línea de presupuesto
| Campo | Tipo | Reglas |
|---|---|---|
| id | identificador único | |
| description | texto | Puede estar vacía en BORRADOR; obligatoria al completar |
| quantityHundredths | entero o vacío | > 0 al completar; hasta 2 decimales |
| unitPrice | entero o vacío | ≥ 0 al completar |
| amount | entero | Solo en `COMPLETO`: cantidad × precio redondeado al peso |
| sourceServiceId | id o vacío | Solo en BORRADOR; sirve para avisar si el precio del catálogo cambió (FR-023) |
| sourcePriceAtAdd | entero o vacío | Precio del catálogo al agregar la línea; se compara al abrir el borrador |

Una línea **es válida** cuando tiene descripción, cantidad > 0 y precio ≥ 0. En un BORRADOR solo las líneas con cantidad > 0 y precio ≥ 0 numéricos entran al cálculo.

## Contador anual (`counters`) — FR-032
Un registro por año con el último número usado. Solo se incrementa dentro de la operación de completar. Eliminar borradores, cancelar o fallar al completar no lo tocan (SC-013, SC-017).

## Estados y transiciones

```text
(nuevo) ──Guardar borrador──▶ BORRADOR ──Guardar borrador──▶ BORRADOR
   │                              │
   │                              ├──Eliminar (con confirmación)──▶ (borrado)
   │                              │
   └──Guardar presupuesto─────────┴──Guardar presupuesto (validar + confirmar)──▶ COMPLETO  (final)
```

- **COMPLETO es final**: no existe transición de salida, ni edición ni eliminación (FR-034, FR-038).
- Un presupuesto nuevo que nunca se guardó no existe en el almacenamiento; si se completa directamente con **Guardar presupuesto**, se crea ya como COMPLETO sin pasar por un borrador guardado.

### Operaciones del almacenamiento y sus garantías

| Operación | Qué hace | Garantía |
|---|---|---|
| `saveDraft(quote)` | Crea o actualiza un borrador. Solo rechaza valores no numéricos en cantidad o precio | Rechaza si el presupuesto ya es COMPLETO |
| `completeQuote(draft)` | Recibe el borrador en memoria (nuevo o ya guardado). Valida todo (cliente, líneas, perfil mínimo), calcula totales, toma el siguiente número del año, fija fechas, copia perfil/cliente/porcentajes y escribe el presupuesto como COMPLETO (lo crea si era nuevo) | **Una sola transacción**: o se escribe todo o nada; el contador y el presupuesto cambian juntos; la validación se repite dentro (no se confía solo en la pantalla). Rechaza si ya existe un registro con ese id que no sea BORRADOR. Si falla o se cancela, un presupuesto nuevo sigue sin existir y un borrador conserva su última versión guardada |
| `deleteDraft(id)` | Elimina un borrador | Rechaza si es COMPLETO; no toca el contador |
| `deleteClient(id)` | Elimina el cliente y deja `clientId` vacío en los borradores que lo usaban | Los COMPLETO conservan su copia |

Estas garantías viven en la capa de datos, no solo en la pantalla: intentar editar, completar de nuevo o eliminar un presupuesto COMPLETO se rechaza aunque se llegue por su dirección directa o se manipulen los controles (FR-034).

## Reglas de cálculo (en `domain/calc.ts`)

Con enteros (cantidad en centésimas, "redondeo medio hacia arriba"):

- `importe_línea = redondear(cantidadCentésimas × precio / 100)`
- `base = Σ importes de líneas con cantidad > 0 y precio ≥ 0`
- `iva = redondear(base × 19 / 100)`
- `retención = cliente EMPRESA ? redondear(base × pct / 100) : 0`
- `total = base + iva − retención`
- Sin cliente: se muestran base e IVA; retención y total muestran el aviso "Selecciona un cliente para calcular la retención y el total" (FR-026).

Ejemplo (spec): líneas 350.000 + 120.000 + 200.000 → base 670.000; IVA 127.300; retención 11 % 73.700 → total 723.600 (empresa) / 797.300 (persona natural).
