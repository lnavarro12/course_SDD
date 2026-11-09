# Quickstart: arrancar, verificar y publicar

Guía de validación de PresupuestosPro. Las dos primeras secciones son para quien construye; **la sección 3 la puede hacer una persona no técnica** usando solo la aplicación (Principio IV). No contiene código de implementación.

## 1. Requisitos y comandos (para quien construye)

Requisitos: Node.js 20 LTS o superior y un navegador actualizado.

| Para… | Comando |
|---|---|
| Instalar dependencias | `npm install` |
| Abrir la app en modo desarrollo | `npm run dev` (la dirección aparece en la terminal) |
| Ejecutar las pruebas automáticas | `npm test` |
| Generar la carpeta publicable | `npm run build` → crea `dist/` |
| Probar la versión publicable en local | `npm run preview` |

El proyecto no usa variables de entorno ni claves.

## 2. Publicar (un solo paso manual)

1. Ejecutar `npm run build`.
2. En el hosting estático elegido (recomendado: Netlify), arrastrar la carpeta `dist/`.
3. Abrir la dirección HTTPS que entrega el hosting, desde un móvil y desde un computador.
4. Al abrirla por primera vez con Internet, la app queda guardada en el dispositivo para usarla sin conexión. En el móvil se puede "Añadir a la pantalla de inicio" (en iPhone se recomienda, ver riesgos en [research.md](research.md)).

## 3. Verificación con la aplicación (persona no técnica)

Prepara: abre la app. En **Configuración** escribe tu nombre y NIT/CC y sube un logo; deja la retención en 11 %. En **Clientes** crea "Empresa Demo" (tipo Empresa, con NIT) y "Ana Pérez" (Persona natural). En **Servicios** crea `LOGO-01` · Diseño de logotipo · 350000, `TARJ-01` · Diseño de tarjetas · 60000 y `MAN-01` · Manual de identidad · 200000.

| # | Escenario | Pasos | Resultado esperado |
|---|---|---|---|
| A | Guardar un borrador incompleto | Nuevo presupuesto, sin cliente ni líneas → **Guardar borrador** | Mensaje "Borrador guardado."; en el listado aparece como **BORRADOR**, sin número ni fecha de emisión, con fecha de última modificación |
| B | Continuar un borrador | Abrir ese borrador, elegir "Empresa Demo", agregar `LOGO-01`, `TARJ-01` (cantidad 2) y `MAN-01`, **Guardar borrador**; cerrar la pestaña y volver a abrir la app | Todo sigue ahí y sigue editable |
| C | Completar | Abrir el borrador → **Guardar presupuesto** → confirmar | Número `2026-001`, fecha de emisión de hoy, vencimiento 30 días después, estado **COMPLETO** |
| D | Presupuesto inválido | Nuevo presupuesto sin cliente → **Guardar presupuesto** | Lista de errores; sigue en borrador; el siguiente que completes recibe el número que tocaba |
| E | Inmutabilidad | Abrir el completo e intentar cambiar cliente, líneas, cantidades y precios; pegar su dirección directa en otra pestaña del navegador | Todo en solo lectura; no hay botones de guardar ni eliminar |
| F | PDF | Completo → **Vista previa** → **Descargar PDF** | Mismos datos en ambos; archivo `PRESUPUESTO-2026-001.pdf` con título PRESUPUESTO, logo, líneas, base, IVA, retención y total |
| G | PDF de borrador | Abrir un borrador e intentar vista previa o descarga | Mensaje: primero debe guardarse como definitivo |
| H | Fallo al completar | Con el dispositivo sin espacio libre o con el navegador en modo privado, intentar **Guardar presupuesto** | Mensaje de error; el presupuesto sigue como borrador y no se gasta un número (esta prueba también está automatizada) |

### Cifras que deben coincidir (SC-002)

Con líneas $350.000 + 2 × $60.000 + $200.000: **Base $670.000 · IVA $127.300**.

- Cliente **Empresa Demo** (retención 11 %): retención $73.700 → **Total $723.600**.
- Cliente **Ana Pérez** (Persona natural): retención $0 → **Total $797.300**.
- Con retención 4 % y empresa: retención $26.800 → total $770.500.

### Otras comprobaciones rápidas

| Qué comprobar | Cómo | Esperado |
|---|---|---|
| Sin conexión (SC-007) | Abrir la app una vez con Internet; desactivar Wi‑Fi/datos; crear un borrador, completarlo y descargar el PDF | Todo funciona |
| Una sola pestaña (FR-006) | Abrir la app en una segunda pestaña | Aviso de que ya está abierta; no se puede editar |
| Datos congelados (SC-009) | Cambiar el precio de un servicio, el nombre del perfil, el logo o la retención; abrir un presupuesto completo | Sin cambios en el completo |
| Borradores y catálogo (FR-023) | Cambiar el precio de un servicio usado en un borrador; abrir el borrador | Aviso del cambio; la línea conserva su precio |
| Eliminar borrador (SC-019) | Eliminar un borrador y confirmar; reabrir la app | No reaparece; completar otro presupuesto sigue la numeración sin saltos |
| Móvil (360 px) | Repetir A a F en un teléfono | Pantallas legibles, botones tocables, sin desplazamiento horizontal |
| Textos en español (FR-042) | Descripción "Diseño de pañuelos y señalización" | Tildes y ñ correctas en pantalla y PDF |

## 4. Qué cubren las pruebas automáticas (`npm test`)

Reglas que se prueban sin abrir la app, para proteger lo que cuesta dinero si falla:

- Cálculo de importes, base, IVA, retención y total con los ejemplos del spec y casos de redondeo.
- "Datos suficientes" en borradores (líneas parciales, sin cliente).
- Completar: número consecutivo, reinicio por año, fechas con hora de Colombia, atomicidad ante un fallo simulado.
- Que un presupuesto COMPLETO rechace edición y eliminación.
- Que la vista previa y el PDF consuman el mismo modelo del documento.
- Unicidad de códigos de servicio sin distinguir mayúsculas.
