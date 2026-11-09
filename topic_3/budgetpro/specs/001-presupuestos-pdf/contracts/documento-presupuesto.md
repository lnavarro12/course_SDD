# Contrato del documento PRESUPUESTO

Define **qué contiene y en qué orden** el presupuesto. La vista previa en pantalla y el PDF se generan a partir de este mismo contenido ya formateado (`src/document/quote-document.ts`); por eso siempre muestran lo mismo (FR-040, SC-010). Solo existe para presupuestos **COMPLETO**.

## Contenido, de arriba hacia abajo

1. **Encabezado**
   - Título: **PRESUPUESTO** (nunca "factura").
   - Logo del profesional (si lo tiene configurado; si no, se omite sin dejar hueco).
   - Número: `AAAA-NNN`.
   - Fecha de emisión y fecha de vencimiento (`DD/MM/AAAA`).
2. **Datos del profesional** (copia consolidada): nombre o razón social, NIT/CC, y los que existan de correo, teléfono y dirección.
3. **Datos del cliente** (copia consolidada): nombre o razón social, tipo (Persona natural / Empresa), NIT/CC si existe, y los que existan de correo, teléfono y dirección.
4. **Detalle**: una fila por línea, con **Descripción · Cantidad · Precio unitario · Importe**. Sin código de servicio. Las descripciones largas se ajustan en varias líneas; si hay muchas filas, continúan en páginas siguientes repitiendo el encabezado de la tabla.
5. **Resumen económico**:
   - Base
   - IVA (19 %)
   - Retención en la fuente (X %) — se muestra solo si el cliente es empresa, como valor restado
   - **TOTAL**

## Reglas de presentación

- Moneda y formato: `$1.234.567`, sin decimales.
- Cantidades: con coma decimal solo si es necesario (`1`, `1,5`, `2,25`).
- Fechas: `DD/MM/AAAA`.
- Textos con tildes y ñ siempre legibles.
- Si el cliente es persona natural, la línea de retención no aparece.
- Ningún texto sobre "factura" ni sobre envío por correo.
- El nombre del archivo es `PRESUPUESTO-AAAA-NNN.pdf`.

## Garantías

| Garantía | Cómo se verifica |
|---|---|
| Vista previa = PDF | Prueba automática: ambos consumen el mismo modelo; revisión manual en el [quickstart](../quickstart.md) |
| El contenido proviene del presupuesto consolidado, no de los datos actuales | Cambiar perfil, cliente, catálogo o porcentaje no altera el documento |
| Descargar otra vez no cambia nada | Número, fechas y totales idénticos en cada descarga |
