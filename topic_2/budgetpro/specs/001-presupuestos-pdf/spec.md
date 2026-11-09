# Feature Specification: PresupuestosPro — Presupuestos profesionales en PDF

**Feature Branch**: `001-presupuestos-pdf`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Herramienta web para que un profesional independiente en Colombia estandarice la creación de presupuestos (servicios, valores, IVA y retención en la fuente) y los descargue como PDF con imagen profesional, reemplazando su plantilla manual en Excel."

## Contexto

Hoy el profesional arma sus presupuestos a mano en una plantilla de Excel: calcula impuestos y retenciones manualmente y el resultado se ve poco profesional ante sus clientes. PresupuestosPro automatiza el proceso y entrega un PDF ordenado con su identidad visual.

- **Usuario**: el propio profesional (un solo usuario, uso individual). Sabe usar una web normal, pero no quiere saber de impuestos más allá de lo justo.
- **Destinatario del presupuesto**: el cliente. No usa la herramienta; recibe el PDF por correo que el profesional le envía por su cuenta.
- **Mercado**: Colombia. Idioma: español. Moneda: pesos colombianos (COP).
- **Estados del presupuesto**: todo presupuesto está en estado **BORRADOR** (en construcción, editable, puede estar incompleto) o **COMPLETO** (definitivo, solo lectura, con número y fechas). El paso de BORRADOR a COMPLETO es irreversible y solo lo ejecuta el usuario con la acción **Guardar presupuesto**. La acción **Guardar borrador** guarda avances sin cambiar el estado.

## Clarifications

### Session 2026-11-05

- Q: ¿Qué pasa si la aplicación se abre en dos pestañas o ventanas a la vez? → A: Solo se permite una pestaña a la vez; la segunda avisa que ya está abierta en otra y no permite editar.
- Q: ¿El PDF muestra el código del servicio en cada línea? → A: No. Solo descripción, cantidad, precio unitario e importe, igual en la previsualización; el código es solo del catálogo.

### Session 2026-11-06

- Q: ¿Existen estados de presupuesto y qué permite cada uno? → A: Sí, BORRADOR y COMPLETO. El borrador se guarda en cualquier momento aunque esté incompleto (sin cliente, sin líneas, con líneas parciales), es editable, no tiene número ni fechas y no consume numeración. El completo es definitivo y de solo lectura. (Reemplaza la decisión previa de que "no existen borradores" y de que todo presupuesto guardado es editable.)
- Q: ¿Cuándo se asigna el número consecutivo y las fechas? → A: Solo al completar el presupuesto con **Guardar presupuesto**, tras pasar las validaciones y una confirmación explícita del usuario; el número, las fechas y el cambio de estado son una operación atómica. Si falla, sigue en BORRADOR y no consume número. (Reemplaza "se asigna al guardar por primera vez".)
- Q: ¿Se puede previsualizar o descargar un borrador? → A: No. Solo los presupuestos COMPLETO se previsualizan y descargan; en un borrador la aplicación indica que primero debe completarse. (Reemplaza "hay que guardar primero".)
- Q: Al cambiar el cliente, ¿qué datos y porcentaje se usan? → A: Solo se puede cambiar en un BORRADOR: se toman los datos del cliente nuevo y se reevalúa la retención según su tipo, con el porcentaje de retención vigente de la configuración. Al completar, los porcentajes y datos quedan consolidados y ya no cambian. (Actualiza la decisión previa sobre cambio de cliente en presupuestos guardados.)
- Q: Si hay un error en un presupuesto COMPLETO, ¿cómo se corrige en la v1? → A: No hay corrección: el usuario crea un presupuesto nuevo desde cero; el erróneo conserva su número y sigue en el listado. "Duplicar como borrador" y "Anular" quedan como propuestas para una versión futura.
- Q: Mientras un presupuesto está en BORRADOR, ¿qué porcentaje de retención usa si cambia la configuración? → A: Siempre el porcentaje actual de la configuración; el vigente al completar queda consolidado.
- Q: ¿Puede el usuario eliminar un borrador? → A: Sí, con confirmación y de forma definitiva; los presupuestos COMPLETO nunca se eliminan. El listado muestra la fecha de última modificación de cada borrador para distinguirlos. (Acota la exclusión previa de "eliminación de presupuestos".)
- Q: Sin cliente seleccionado en un borrador, ¿qué muestra el resumen económico? → A: Muestra base e IVA; en retención y total aparece el aviso "Selecciona un cliente para calcular la retención y el total".
- Q: Si un servicio del catálogo cambia de precio mientras un borrador lo usa, ¿qué pasa con la línea? → A: La línea conserva la descripción y el precio con que se agregó; al abrir el borrador, la aplicación avisa si el precio del catálogo cambió, sin modificar la línea.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir la aplicación sin cuenta y conservar mis datos (Priority: P1)

El profesional abre la aplicación en su navegador sin crear cuenta ni escribir contraseña. Todo lo que registra (perfil, catálogo, clientes, borradores y presupuestos completos) sigue ahí cuando cierra la aplicación y vuelve a entrar, incluso sin conexión a Internet una vez cargada.

**Why this priority**: sin acceso directo y sin persistencia, ninguna otra historia tiene valor.

**Independent Test**: registrar un dato cualquiera (p. ej. un cliente), cerrar la pestaña del navegador, volver a abrir la aplicación y comprobar que el dato sigue ahí.

**Acceptance Scenarios**:

1. **Given** que el profesional abre la aplicación por primera vez, **When** carga la pantalla, **Then** puede usarla de inmediato, sin pedirle usuario, contraseña ni registro.
2. **Given** que registró clientes, servicios, borradores y presupuestos completos, **When** cierra la aplicación y la vuelve a abrir, **Then** toda esa información está disponible, sin autenticación.
3. **Given** que la aplicación ya fue abierta una vez, **When** el profesional pierde la conexión a Internet, **Then** puede seguir creando y consultando presupuestos con normalidad.
4. **Given** que la aplicación se cierra de forma inesperada, **When** la vuelve a abrir, **Then** los datos guardados antes del cierre siguen disponibles.
5. **Given** que la aplicación ya está abierta en una pestaña, **When** el usuario la abre en una segunda pestaña o ventana, **Then** esta le avisa que ya está abierta en otra y no le permite editar.
6. **Given** que el almacenamiento del equipo no está disponible o falla, **When** el profesional intenta guardar, **Then** la aplicación le informa que no pudo guardar y qué hacer.

---

### User Story 2 - Configurar mis datos profesionales y fiscales (Priority: P1)

El profesional registra una sola vez los datos que lo identifican (nombre o razón social, NIT/CC, correo, teléfono, dirección, logo) y el porcentaje de retención en la fuente que le corresponde. Esos datos se incorporan a cada presupuesto cuando este se completa.

**Why this priority**: sin identidad profesional y porcentajes configurados no se puede completar un presupuesto válido.

**Independent Test**: llenar la configuración, guardar, cerrar y reabrir la aplicación, y verificar que los datos y el logo siguen ahí.

**Acceptance Scenarios**:

1. **Given** la pantalla de configuración, **When** el profesional ingresa nombre o razón social y NIT/CC (obligatorios) y opcionalmente correo, teléfono, dirección y logo, **Then** los datos quedan guardados.
2. **Given** que intenta guardar sin nombre o sin NIT/CC, **When** pulsa guardar, **Then** la aplicación indica cuál campo es obligatorio.
3. **Given** que carga un archivo que no es imagen PNG o JPG, o que pesa más de 2 MB, **When** lo selecciona como logo, **Then** lo rechaza e informa los formatos y el tamaño permitidos, sin bloquearse.
4. **Given** que ve la configuración fiscal, **When** la revisa, **Then** el IVA aparece como 19 % fijo, sin poder editarlo, y la retención en la fuente se elige entre 4 %, 6 %, 10 % y 11 % (11 % por defecto).
5. **Given** que modificó sus datos o su porcentaje de retención, **When** continúa un borrador o crea uno nuevo, **Then** estos usan los valores actualizados hasta que se completen; los presupuestos completos no cambian.

---

### User Story 3 - Gestionar mis clientes (Priority: P1)

El profesional registra sus clientes una vez (nombre o razón social, NIT/CC, datos de contacto y tipo: persona natural o empresa) y los reutiliza en sus presupuestos. El tipo de cliente determina si se aplica retención en la fuente.

**Why this priority**: todo presupuesto completo debe tener un cliente y el tipo define el cálculo.

**Independent Test**: crear un cliente, verlo en la lista, editarlo y eliminarlo.

**Acceptance Scenarios**:

1. **Given** el formulario de cliente, **When** ingresa nombre o razón social y tipo, **Then** el cliente se guarda. El NIT/CC es obligatorio si el tipo es empresa; correo, teléfono y dirección son opcionales.
2. **Given** que intenta guardar sin nombre o sin tipo, **When** pulsa guardar, **Then** la aplicación lo impide e indica qué falta.
3. **Given** que registra un cliente con un NIT/CC que ya existe, **When** guarda, **Then** la aplicación advierte del posible duplicado y le permite guardar de todos modos.
4. **Given** una lista de clientes, **When** el profesional consulta, edita o elimina uno, **Then** los cambios se reflejan en la lista.
5. **Given** que elimina un cliente con presupuestos COMPLETO, **When** consulta esos presupuestos, **Then** siguen disponibles con los datos del cliente tal como estaban.
6. **Given** que elimina un cliente asignado a un BORRADOR, **When** abre ese borrador, **Then** el borrador queda sin cliente seleccionado y el usuario debe elegir otro antes de completarlo.
7. **Given** que cambia el tipo de un cliente, **When** consulta presupuestos COMPLETO, **Then** estos no cambian; los borradores que usan ese cliente recalculan la retención con el tipo actualizado.

---

### User Story 4 - Mantener un catálogo de servicios (Priority: P2)

El profesional guarda sus servicios con código, descripción y precio habitual para incorporarlos rápidamente a sus presupuestos.

**Why this priority**: acelera la creación, pero se puede cotizar con conceptos manuales sin catálogo.

**Independent Test**: crear, listar, editar y eliminar servicios; intentar crear uno con código repetido.

**Acceptance Scenarios**:

1. **Given** el formulario de servicio, **When** ingresa código, descripción y precio (cero o mayor), **Then** el servicio queda en el catálogo.
2. **Given** que ya existe un servicio con el código `LOGO-01`, **When** intenta crear otro con `logo-01` (sin distinguir mayúsculas), **Then** la aplicación lo impide y explica el motivo.
3. **Given** que intenta guardar un servicio sin descripción o con precio negativo, **When** pulsa guardar, **Then** la aplicación lo rechaza e indica el dato a corregir.
4. **Given** que modifica o elimina un servicio ya usado en presupuestos (borradores o completos), **When** consulta esos presupuestos, **Then** las líneas conservan la descripción y el precio con que se agregaron.

---

### User Story 5 - Crear, guardar como borrador y completar un presupuesto (Priority: P1)

El profesional crea un presupuesto, que empieza como BORRADOR. Va agregando cliente y líneas (desde el catálogo o manuales) a su ritmo; la aplicación calcula automáticamente importes, base, IVA, retención y total cuando hay datos suficientes. Puede guardar avances con **Guardar borrador** cuantas veces quiera, aunque esté incompleto. Cuando está conforme, pulsa **Guardar presupuesto**: la aplicación valida, pide confirmación y lo convierte en COMPLETO, con número y fechas.

**Why this priority**: es el núcleo del producto.

**Independent Test**: crear un presupuesto con los ejemplos de "Ejemplos de cálculo", guardarlo como borrador, completarlo y comprobar que los totales coinciden.

**Acceptance Scenarios**:

1. **Given** que inicia un presupuesto, **When** se crea, **Then** está en estado BORRADOR, sin número ni fechas.
2. **Given** un presupuesto nuevo sin cliente y sin líneas, **When** pulsa **Guardar borrador**, **Then** se guarda correctamente, la aplicación confirma el guardado, su estado es BORRADOR y no tiene número ni fecha de emisión ni de vencimiento.
3. **Given** un borrador con líneas parciales (por ejemplo, sin descripción o sin precio), **When** pulsa **Guardar borrador**, **Then** se guarda con esa información parcial.
4. **Given** un borrador guardado, **When** cierra y reabre la aplicación y lo abre, **Then** conserva todos sus datos, sigue en BORRADOR y sigue siendo editable.
5. **Given** un borrador abierto, **When** selecciona un cliente existente, **Then** sus datos se incorporan; también puede registrar un cliente nuevo en ese momento y cambiar de cliente cuando quiera.
6. **Given** que agrega un servicio del catálogo, **When** lo selecciona, **Then** la línea se llena con su descripción y precio habitual, y el usuario puede modificar descripción, cantidad y precio sin alterar el catálogo; también puede eliminar la línea.
7. **Given** que agrega un concepto manual con descripción, cantidad y precio, **When** lo confirma, **Then** la aplicación ofrece guardarlo en el catálogo; si acepta, solicita (o propone) un código único; si no, el concepto queda solo en ese presupuesto.
8. **Given** que intenta agregar un servicio del catálogo que ya está en el presupuesto, **When** lo selecciona, **Then** la aplicación lo bloquea con un aviso.
9. **Given** un borrador con al menos una línea con cantidad y precio válidos, **When** agrega, modifica o elimina líneas o cambia el cliente, **Then** importes, base, IVA y total se recalculan al instante; la retención y el total se calculan en cuanto hay un cliente seleccionado; mientras tanto, el resumen muestra el aviso "Selecciona un cliente para calcular la retención y el total".
10. **Given** un cliente persona natural, **When** se calcula el total, **Then** la retención es $0 y no se muestra como descuento; con cliente empresa se aplica el porcentaje de retención configurado sobre la base.
11. **Given** un borrador con cliente, datos profesionales configurados y al menos una línea válida, **When** pulsa **Guardar presupuesto**, **Then** la aplicación pide confirmación explícita (indicando que es definitivo y no se podrá editar); al confirmar, el presupuesto pasa a COMPLETO.
12. **Given** que el presupuesto se completó, **When** se muestra, **Then** tiene un número `AAAA-NNN` único (reinicia en 001 cada año), la fecha de emisión del día y un vencimiento 30 días naturales después, y queda habilitada la previsualización y descarga.
13. **Given** un borrador sin cliente, sin líneas válidas, con alguna línea sin descripción, con cantidad 0 o negativa, con precio negativo o sin nombre o NIT/CC del profesional configurados, **When** pulsa **Guardar presupuesto**, **Then** la aplicación indica qué corregir, el presupuesto sigue en BORRADOR y no consume número.
14. **Given** que la confirmación de **Guardar presupuesto** se cancela, **When** vuelve al formulario, **Then** el presupuesto sigue en BORRADOR, editable y sin número.
15. **Given** que el almacenamiento falla mientras se completa el presupuesto, **When** ocurre el error, **Then** la aplicación informa el problema, el presupuesto sigue en BORRADOR con su información anterior intacta y no se consume número.
16. **Given** un presupuesto COMPLETO, **When** se abre, **Then** no se muestran los botones **Guardar borrador** ni **Guardar presupuesto** y no se puede volver a BORRADOR.
17. **Given** un borrador con una línea tomada del catálogo cuyo precio cambió después en el catálogo, **When** el usuario abre el borrador, **Then** la aplicación le avisa del cambio de precio y la línea conserva el precio con que se agregó; solo cambia si el usuario la modifica.

---

### User Story 6 - Previsualizar y descargar el PDF (Priority: P1)

El profesional revisa cómo se ve un presupuesto COMPLETO y lo descarga como PDF para enviarlo él mismo por correo. Los borradores no generan documento.

**Why this priority**: el PDF profesional es el resultado que el usuario necesita.

**Independent Test**: previsualizar un presupuesto COMPLETO, descargarlo y abrir el PDF; comparar que ambos muestran lo mismo.

**Acceptance Scenarios**:

1. **Given** un presupuesto COMPLETO, **When** pulsa previsualizar, **Then** ve el documento con título **PRESUPUESTO**, logo y datos profesionales, datos del cliente, número, fecha de emisión, fecha de vencimiento, todas las líneas (descripción, cantidad, precio unitario e importe, sin código de servicio), base, IVA, retención (si aplica) y total.
2. **Given** un presupuesto COMPLETO, **When** descarga el PDF, **Then** el archivo contiene exactamente la misma información que la previsualización, se guarda como `PRESUPUESTO-AAAA-NNN.pdf` y no se envía nada por correo.
3. **Given** un BORRADOR, **When** intenta previsualizarlo o descargarlo, **Then** la aplicación bloquea ambas acciones y le indica que primero debe completar el presupuesto.
4. **Given** un presupuesto COMPLETO, **When** lo previsualiza o descarga varias veces, **Then** no cambia el presupuesto ni sus fechas.
5. **Given** un presupuesto con muchas líneas o descripciones largas, **When** genera el PDF, **Then** el contenido se reparte en varias páginas sin cortar ni perder texto.
6. **Given** textos con tildes, ñ y signos propios del español, **When** se genera el PDF, **Then** se ven correctamente.
7. **Given** que no configuró logo, **When** genera el PDF, **Then** se genera sin logo.
8. **Given** que descarga el mismo presupuesto dos veces, **When** el navegador detecta un archivo con el mismo nombre, **Then** no sobrescribe sin que el usuario lo decida (gestionado por el navegador).
9. **Given** que falla la generación del PDF, **When** ocurre el error, **Then** la aplicación informa el problema y qué hacer.

---

### User Story 7 - Consultar presupuestos y continuar borradores (Priority: P2)

El profesional ve el listado de sus presupuestos con su estado, continúa editando sus borradores y consulta, previsualiza y descarga los presupuestos completos.

**Why this priority**: permite retomar el trabajo y recuperar información, pero no bloquea la primera entrega del presupuesto.

**Independent Test**: abrir un borrador, cambiar un precio, guardarlo como borrador, completarlo y verificar que el listado, la previsualización y el PDF muestran el resultado; luego intentar editar el completo.

**Acceptance Scenarios**:

1. **Given** que no hay presupuestos, **When** abre el listado, **Then** ve un mensaje indicando que aún no hay presupuestos.
2. **Given** presupuestos guardados, **When** abre el listado, **Then** cada fila muestra la etiqueta de estado **BORRADOR** o **COMPLETO**, y además: número y fecha de emisión (solo los completos), fecha de última modificación (solo los borradores), cliente (si está definido) y total (si hay datos suficientes para calcularlo).
3. **Given** un BORRADOR del listado, **When** lo abre, **Then** se abre en modo edición con los botones **Guardar borrador** y **Guardar presupuesto**.
4. **Given** un presupuesto COMPLETO del listado, **When** lo abre, **Then** se abre en modo de solo lectura y permite consultar la información, previsualizarlo y descargar su PDF.
5. **Given** un presupuesto COMPLETO abierto, **When** intenta cambiar el cliente, agregar, modificar o eliminar servicios, cambiar cantidades o precios, o modificar porcentajes, fechas, número o totales, **Then** no puede: todos los campos son de solo lectura y no existen acciones de guardado o edición.
6. **Given** la dirección de edición de un presupuesto COMPLETO, **When** el usuario la abre directamente en el navegador, **Then** la aplicación lo muestra en solo lectura y no permite guardar cambios.
7. **Given** un BORRADOR con cambios sin guardar, **When** intenta salir de la pantalla o cerrar la aplicación, **Then** la aplicación le advierte de los cambios pendientes.
8. **Given** que cambió sus datos profesionales, logo o porcentajes, o el tipo de un cliente, después de completar un presupuesto, **When** abre ese presupuesto, **Then** conserva los valores con que fue completado.
9. **Given** un BORRADOR que usa un cliente y un porcentaje de retención, **When** el usuario cambia el cliente, **Then** los datos del cliente nuevo reemplazan a los anteriores y la retención se reevalúa: $0 si es persona natural, o el porcentaje de retención configurado si es empresa.
10. **Given** un BORRADOR en el listado, **When** pulsa eliminar y confirma, **Then** el borrador desaparece del listado de forma definitiva y no se consume ningún número; si cancela la confirmación, el borrador permanece.
11. **Given** un presupuesto COMPLETO, **When** revisa sus acciones disponibles, **Then** no existe la opción de eliminarlo.

---

### Ejemplos de cálculo

Reglas: IVA 19 % sobre la base; retención en la fuente (ejemplo con 11 %) sobre la base, solo para clientes empresa; total = base + IVA − retención.

| Concepto | Cantidad | Precio unitario | Importe |
|---|---|---|---|
| Diseño de logotipo | 1 | $350.000 | $350.000 |
| Diseño de tarjetas | 2 | $60.000 | $120.000 |
| Manual de identidad | 1 | $200.000 | $200.000 |

| Resumen | Cliente empresa (retención 11 %) | Cliente persona natural |
|---|---|---|
| Base | $670.000 | $670.000 |
| IVA (19 %) | +$127.300 | +$127.300 |
| Retención en la fuente (11 %) | −$73.700 | $0 |
| **TOTAL** | **$723.600** | **$797.300** |

Con retención del 4 % y cliente empresa: retención $26.800, total $770.500.

### Edge Cases

- Cantidad decimal (p. ej. 1,5 horas): se permite con hasta 2 decimales.
- Precio cero (servicio gratuito): se permite en catálogo y en líneas.
- Cantidad × precio genera fracción de peso: el importe se redondea al peso más cercano (medio hacia arriba).
- Borrador con líneas parciales (sin descripción, cantidad o precio): se guarda; solo las líneas con cantidad mayor que cero y precio igual o superior a cero entran en los cálculos, las demás se muestran como incompletas.
- Borrador sin cliente: se muestran importes, base e IVA de las líneas válidas; en retención y total aparece el aviso "Selecciona un cliente para calcular la retención y el total" hasta que se seleccione un cliente.
- Borrador con un valor no numérico en cantidad o precio: no se puede guardar ese valor y la aplicación indica el campo (única restricción de guardado de un borrador).
- Cliente cambiado en un borrador después de agregar líneas: la retención se recalcula.
- Cliente eliminado mientras un borrador lo usa: el borrador queda sin cliente; los presupuestos COMPLETO conservan sus datos.
- Precio de un servicio cambiado en el catálogo mientras un borrador lo usa: la línea conserva su precio y al abrir el borrador se avisa del cambio; si el servicio se eliminó, la línea no cambia.
- Cambio de porcentaje de retención con borradores existentes: los borradores usan el nuevo porcentaje hasta que se completen; los completos no cambian.
- Descripciones muy largas o logo con proporciones inusuales: el PDF se adapta sin deformar el logo ni perder texto.
- Abrir la aplicación en una segunda pestaña o ventana: la segunda avisa que ya está abierta en otra y no permite editar, así no se repiten números de presupuesto ni se pisan datos.
- Cierre inesperado mientras se guarda un borrador: el borrador conserva su versión guardada anterior, sin datos corruptos.
- Cierre inesperado o error de almacenamiento mientras se completa un presupuesto: queda completo con número y fechas, o sigue en BORRADOR sin número; nunca en un estado intermedio ni con número repetido o consumido sin completarse.
- Cancelar la confirmación de **Guardar presupuesto**: sigue en BORRADOR, sin número.
- Intento de previsualizar o descargar un BORRADOR: se bloquea con el mensaje de que primero debe completarse.
- Intento de modificar un presupuesto COMPLETO (por la pantalla, por su dirección directa o manipulando los controles): no se aplica ningún cambio.
- Eliminar un borrador: pide confirmación; si se confirma es definitivo y no consume numeración; si falla el almacenamiento, el borrador permanece.
- Error en un presupuesto COMPLETO: no se puede corregir ni anular; el usuario crea uno nuevo y el anterior conserva su número.
- Presupuesto que ya no existe: la aplicación informa que no está disponible.
- Cambio de año: el número usa el año de la fecha de emisión (el día en que se completa) y la numeración vuelve a 001 al empezar el año.

## Requirements *(mandatory)*

### Functional Requirements

**Acceso y datos**
- **FR-001**: El sistema MUST permitir usar la aplicación sin cuenta, usuario ni contraseña.
- **FR-002**: El sistema MUST conservar perfil, configuración fiscal, clientes, catálogo, borradores y presupuestos completos al cerrar y volver a abrir la aplicación.
- **FR-003**: El sistema MUST permitir crear y consultar presupuestos sin conexión a Internet una vez cargada la aplicación.
- **FR-004**: El sistema MUST informar al usuario, en lenguaje comprensible, de cualquier error: qué ocurrió y qué debe hacer para corregirlo.
- **FR-005**: El sistema MUST advertir cuando existan cambios sin guardar en un borrador antes de salir.
- **FR-006**: El sistema MUST permitir editar desde una sola pestaña o ventana a la vez; si se abre una segunda, MUST avisar que la aplicación ya está abierta en otra y no permitir editar en ella.

**Perfil y configuración**
- **FR-007**: El sistema MUST permitir registrar y modificar nombre o razón social (obligatorio), NIT/CC (obligatorio), correo, teléfono, dirección y logo (opcionales).
- **FR-008**: El sistema MUST aceptar logos PNG o JPG de hasta 2 MB y rechazar otros archivos con un mensaje que indique los formatos permitidos.
- **FR-009**: El IVA MUST ser 19 % fijo, visible y no editable.
- **FR-010**: El usuario MUST poder elegir su porcentaje de retención en la fuente entre 4 %, 6 %, 10 % y 11 %; el valor por defecto es 11 %. No se aceptan otros valores.

**Clientes**
- **FR-011**: El sistema MUST permitir crear, consultar, modificar y eliminar clientes con nombre o razón social (obligatorio), tipo (obligatorio: persona natural o empresa), NIT/CC (obligatorio para empresa), y correo, teléfono y dirección opcionales.
- **FR-012**: El sistema MUST mostrar el tipo de cliente de forma explícita y usarlo para decidir la retención: empresa → se aplica; persona natural → $0.
- **FR-013**: El sistema MUST advertir de un NIT/CC repetido y permitir guardar igualmente.
- **FR-014**: Al eliminar un cliente, los presupuestos COMPLETO MUST conservar sus datos y los borradores que lo usaban MUST quedar sin cliente seleccionado.

**Catálogo**
- **FR-015**: El sistema MUST permitir crear, consultar, modificar y eliminar servicios con código, descripción (obligatoria) y precio (mayor o igual a cero).
- **FR-016**: El código de servicio MUST ser único, sin distinguir mayúsculas de minúsculas.

**Presupuestos: estados y borradores**
- **FR-017**: Todo presupuesto MUST tener un identificador interno único, independiente del número consecutivo, y un estado: BORRADOR o COMPLETO. Todo presupuesto nuevo MUST iniciar en BORRADOR.
- **FR-018**: En un BORRADOR el usuario MUST poder agregar, modificar y eliminar líneas (del catálogo o manuales), cambiar cantidades y precios, cambiar el cliente, y continuar editando después de cerrar y volver a abrir la aplicación.
- **FR-019**: El sistema MUST ofrecer la acción **Guardar borrador**, disponible en presupuestos nuevos y en BORRADOR, que guarda la información actual, mantiene el estado BORRADOR, no asigna número ni fechas, permite continuar editando, confirma el guardado y puede repetirse cuantas veces se necesite.
- **FR-020**: **Guardar borrador** MUST permitir guardar sin cliente, sin líneas o con líneas parciales; solo MUST rechazar valores no numéricos en cantidad y precio, indicando el campo.
- **FR-021**: Los borradores MUST NOT consumir numeración, MUST NOT tener fecha de emisión ni de vencimiento y MUST NOT poder previsualizarse ni descargarse.
- **FR-022**: Una línea es válida cuando tiene descripción, cantidad mayor que cero (hasta 2 decimales) y precio unitario igual o superior a cero (en pesos enteros); la validez se exige al completar el presupuesto, no al guardar un borrador.
- **FR-023**: El sistema MUST permitir agregar líneas desde el catálogo (cargando descripción y precio) o de forma manual, y modificarlas sin alterar el catálogo; las líneas conservan la descripción y el precio con que se agregaron aunque el catálogo cambie. Al abrir un BORRADOR, el sistema MUST avisar si el precio en el catálogo de algún servicio usado en sus líneas cambió, sin modificar la línea.
- **FR-024**: El sistema MUST bloquear un servicio del catálogo repetido dentro del mismo presupuesto.
- **FR-025**: Al agregar un concepto manual, el sistema MUST ofrecer guardarlo en el catálogo; si el usuario acepta, MUST asignarle un código único (digitado o propuesto).
- **FR-026**: El sistema MUST calcular automáticamente en un BORRADOR, cuando haya datos suficientes: importe de línea = cantidad × precio; base = suma de importes de las líneas con cantidad > 0 y precio ≥ 0; IVA = base × 19 %; retención = base × porcentaje configurado (solo cliente empresa; $0 en persona natural); total = base + IVA − retención. La retención y el total requieren cliente seleccionado; mientras no lo haya, el resumen muestra base e IVA y, en retención y total, el aviso "Selecciona un cliente para calcular la retención y el total".
- **FR-027**: Los cálculos MUST hacerse con precisión decimal; IVA, retención e importes de línea se redondean al peso más cercano (medio hacia arriba).
- **FR-028**: Al cambiar el cliente de un BORRADOR, el sistema MUST tomar los datos del cliente nuevo y reevaluar la retención según su tipo, usando el porcentaje de retención vigente en la configuración.

**Presupuestos: finalización e inmutabilidad**
- **FR-029**: El sistema MUST ofrecer la acción **Guardar presupuesto**, disponible en presupuestos nuevos y en BORRADOR, que ejecuta todas las validaciones y, si hay errores, impide la finalización y muestra mensajes que indican qué corregir.
- **FR-030**: Para completar, el sistema MUST verificar: cliente seleccionado (con su tipo), al menos una línea, todas las líneas válidas y datos profesionales configurados (nombre o razón social y NIT/CC).
- **FR-031**: Si las validaciones pasan, el sistema MUST pedir una confirmación explícita (indicando que el presupuesto quedará definitivo) antes de completarlo; MUST NOT completar ningún presupuesto sin esa acción explícita del usuario.
- **FR-032**: Al confirmar, el sistema MUST ejecutar como una sola operación todo o nada: asignar número `AAAA-NNN` único y consecutivo (reinicia en 001 cada año, año de la fecha de emisión), asignar la fecha de emisión del día, calcular el vencimiento a 30 días naturales, cambiar el estado a COMPLETO y consolidar los datos profesionales, el logo, los datos del cliente, los porcentajes fiscales, las líneas y los totales.
- **FR-033**: Si ocurre un error al completar (incluidos cierres inesperados o fallos de almacenamiento), el presupuesto MUST permanecer en BORRADOR con su información anterior, sin número ni fechas, sin consumir número consecutivo y sin quedar con información parcial; MUST NOT haber números duplicados.
- **FR-034**: Un presupuesto COMPLETO MUST ser definitivo y de solo lectura: no se puede cambiar el cliente, agregar, modificar ni eliminar servicios, cambiar cantidades, precios, porcentajes fiscales, fechas, número ni totales, ni volver a BORRADOR. Esta restricción MUST cumplirse en la pantalla (sin botones de guardado ni campos editables) y también al intentar editarlo por su dirección directa o manipulando los controles.
- **FR-035**: Los datos consolidados de un presupuesto COMPLETO MUST NOT cambiar por modificaciones posteriores del perfil, el logo, la configuración fiscal, los clientes o el catálogo.

**Listado y apertura**
- **FR-036**: El sistema MUST mostrar un listado de presupuestos con la etiqueta de estado (**BORRADOR** o **COMPLETO**) y, según corresponda: número y fecha de emisión (completos), fecha de última modificación (borradores), cliente (si está definido) y total (si hay datos suficientes), y mostrar un mensaje cuando no haya presupuestos.
- **FR-037**: Al abrir un BORRADOR, el sistema MUST mostrarlo en modo edición con **Guardar borrador** y **Guardar presupuesto**; al abrir un COMPLETO, MUST mostrarlo en solo lectura con acceso a previsualización y descarga.
- **FR-038**: El usuario MUST poder eliminar un BORRADOR, previa confirmación explícita; la eliminación es definitiva, no consume numeración y no afecta a otros presupuestos. Los presupuestos COMPLETO MUST NOT poder eliminarse.

**Previsualización y PDF**
- **FR-039**: Solo los presupuestos COMPLETO MUST poder previsualizarse y descargarse como PDF; ante un BORRADOR, el sistema MUST bloquear ambas acciones e indicar que primero debe completarse.
- **FR-040**: La previsualización MUST mostrar exactamente la misma información que tendrá el PDF.
- **FR-041**: El documento MUST titularse **PRESUPUESTO**, no presentarse como factura, e incluir: logo y datos del profesional, datos del cliente, número, fechas de emisión y vencimiento, líneas (descripción, cantidad, precio unitario e importe; sin código de servicio), base, IVA, retención (cuando aplique) y total.
- **FR-042**: Todos los importes MUST expresarse en COP, en pesos enteros con separador de miles (p. ej. `$1.234.567`); las fechas en formato `DD/MM/AAAA`.
- **FR-043**: El PDF MUST ser de diseño profesional predefinido, repartirse en varias páginas cuando haga falta, mostrar correctamente tildes y ñ, y generarse sin logo si no hay uno configurado.
- **FR-044**: El usuario MUST poder previsualizar y descargar un presupuesto COMPLETO tantas veces como necesite, con el nombre `PRESUPUESTO-AAAA-NNN.pdf`; descargar de nuevo MUST NOT modificar el presupuesto ni sus fechas, y el sistema MUST NOT enviarlo por correo.

### Key Entities

- **Perfil profesional**: identidad del usuario en los documentos (nombre o razón social, NIT/CC, correo, teléfono, dirección, logo). Es único.
- **Configuración fiscal**: porcentaje de retención elegido (4, 6, 10 u 11 %); el IVA es fijo (19 %).
- **Cliente**: nombre o razón social, tipo (persona natural / empresa), NIT/CC, contacto. Puede tener muchos presupuestos.
- **Servicio**: elemento del catálogo (código único, descripción, precio habitual).
- **Presupuesto**: identificador interno único (no visible, independiente del número); **estado** (BORRADOR o COMPLETO); cliente (opcional en BORRADOR, obligatorio en COMPLETO); líneas; **número `AAAA-NNN`, fecha de emisión y fecha de vencimiento (solo en COMPLETO)**; **fecha de última modificación (borradores)**; al completarse, copia consolidada de datos profesionales, logo, datos del cliente, porcentajes aplicados, líneas y totales.
- **Línea de presupuesto**: descripción, cantidad, precio unitario e importe; opcionalmente originada en un servicio del catálogo; no depende de él (conserva sus valores), y en un BORRADOR recuerda el servicio de origen solo para avisar si su precio cambió.

## Success Criteria *(mandatory)*

### Measurable Outcomes

Todos se comprueban usando la aplicación o el PDF, sin leer código.

- **SC-001**: Una persona no técnica configura su perfil, registra un cliente y completa su primer presupuesto descargable en menos de 10 minutos.
- **SC-002**: Con las líneas del ejemplo ($350.000, $120.000, $200.000), el presupuesto muestra base $670.000, IVA $127.300 y total $723.600 con cliente empresa (retención 11 %) y $797.300 con persona natural, tanto en pantalla como en el PDF.
- **SC-003**: Al cambiar el cliente de empresa a persona natural en un borrador, el total sube exactamente por el valor de la retención en menos de 1 segundo, sin pulsar ningún botón de cálculo.
- **SC-004**: El 100 % de los presupuestos COMPLETO descargados se titulan "PRESUPUESTO", incluyen número, fecha de emisión, vencimiento 30 días después y el logo configurado.
- **SC-005**: Tras completar 3 presupuestos seguidos, los números son consecutivos (`2026-001`, `2026-002`, `2026-003`) y el primero completado en un año nuevo es `AAAA-001`.
- **SC-006**: Tras cerrar y reabrir la aplicación, el 100 % de perfil, clientes, servicios, borradores y presupuestos completos siguen disponibles sin iniciar sesión.
- **SC-007**: Con la conexión a Internet desactivada, el usuario puede crear un borrador, completarlo y descargar su PDF.
- **SC-008**: Todo intento de completar con datos inválidos (sin cliente, sin líneas, línea sin descripción, cantidad ≤ 0, precio negativo, sin datos profesionales) o de guardar un servicio con código repetido muestra un mensaje que indica qué corregir, en el 100 % de los casos.
- **SC-009**: Después de cambiar el precio de un servicio, el perfil, el logo, el tipo de un cliente o el porcentaje de retención, ningún presupuesto COMPLETO cambia sus importes ni sus datos.
- **SC-010**: La previsualización y el PDF de un presupuesto COMPLETO muestran los mismos datos e importes en el 100 % de los casos.
- **SC-011**: El 100 % de los borradores pueden guardarse sin cliente y sin líneas, y quedan con estado BORRADOR, sin número y sin fechas.
- **SC-012**: El 100 % de los borradores conservan su información y siguen siendo editables después de cerrar y reabrir la aplicación.
- **SC-013**: Ningún borrador consume numeración: tras guardar 5 borradores, el primer presupuesto completado del año recibe `AAAA-001`.
- **SC-014**: El 100 % de los presupuestos COMPLETO tienen número y fechas de emisión y vencimiento válidos.
- **SC-015**: El 100 % de los presupuestos COMPLETO son inmutables: ningún campo es editable en pantalla, no existen botones de guardado y abrir su dirección de edición directamente no permite cambios.
- **SC-016**: Ningún presupuesto en BORRADOR puede previsualizarse ni descargarse como PDF: el 100 % de los intentos muestra el aviso de que debe completarse primero.
- **SC-017**: Ninguna finalización fallida o cancelada consume un número consecutivo: el siguiente presupuesto completado recibe el número que seguía.
- **SC-018**: El 100 % de las filas del listado muestran su estado (BORRADOR o COMPLETO); los borradores muestran fecha de última modificación y no muestran número ni fecha de emisión.
- **SC-019**: Un borrador eliminado con confirmación desaparece del listado y no se recupera tras cerrar y reabrir la aplicación; ningún presupuesto COMPLETO ofrece la opción de eliminar; eliminar un borrador no altera la numeración.
- **SC-020**: Si cambia el precio de un servicio usado en un borrador, el 100 % de las veces la línea conserva su precio y al abrir el borrador aparece un aviso del cambio.

## Assumptions

- Un solo usuario por instalación; no hay roles ni cuentas. Los datos viven en el navegador del equipo; si el usuario borra los datos del navegador, los pierde (no hay respaldo en la v1). Quien use ese navegador ve la información.
- Los porcentajes de retención (4, 6, 10, 11 %) son los habituales para servicios y honorarios en Colombia; el usuario debe confirmar con su contador cuál le corresponde. El IVA del 19 % se aplica a todos los servicios.
- Tipos de cliente: persona natural (sin retención) y empresa (con retención). Se simplifica la realidad tributaria colombiana para la v1.
- NIT/CC es un campo de texto libre sin validación de formato ni dígito de verificación.
- Un borrador usa los datos profesionales, el logo y el porcentaje de retención vigentes en la configuración; se consolidan al completar el presupuesto.
- En un borrador, solo las líneas con cantidad mayor que cero y precio igual o superior a cero entran en los cálculos; la retención y el total requieren cliente seleccionado.
- Eliminar un borrador es definitivo (no hay papelera). Completar un presupuesto es irreversible; no hay historial de versiones, no se puede reabrir un COMPLETO y, si contiene un error, el usuario crea un presupuesto nuevo.
- Los estados de la v1 son solo BORRADOR y COMPLETO; no existe estado "enviado" ni "aceptado" porque la aplicación no envía correos ni gestiona respuestas del cliente.
- Los ejemplos de la spec original en euros se reescribieron en COP con IVA 19 % y retención 11 %.

## Out of Scope (v1)

- Facturación electrónica o documentos fiscales oficiales; conversión de presupuestos en facturas.
- ReteIVA, ReteICA y otras retenciones o impuestos distintos a IVA 19 % y retención en la fuente.
- Envío automático de correos.
- Estados de envío o aceptación por parte del cliente, o cualquier estado distinto de BORRADOR y COMPLETO.
- Cuentas, autenticación, contraseñas y roles.
- Almacenamiento en la nube, respaldos, sincronización o uso desde varios dispositivos.
- Contabilidad, inventario, pagos, CRM y reportes financieros.
- Múltiples monedas, idiomas o países.
- Editor visual de plantillas; solo un formato PDF predefinido.
- Aplicación móvil y integraciones con sistemas externos.
- Historial de versiones y eliminación o anulación de presupuestos COMPLETO (los borradores sí se pueden eliminar).
