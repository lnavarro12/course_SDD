# Feature Specification: PresupuestosPro — Página de inicio, navegación común y rediseño visual

**Feature Branch**: `002-presentacion-profesional`

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Mejorar la presentación de PresupuestosPro (aplicación ya implementada en la spec 001) con dos cambios, sin alterar ninguna funcionalidad ni dato existente. Primero: añadir una página de inicio (index) que sea el punto de entrada de la aplicación al acceder a la raíz del servidor, con navegación clara hacia las cuatro secciones existentes (Presupuestos, Clientes, Catálogo y Perfil) y un pequeño resumen de actividad (por ejemplo, número de presupuestos por estado). Además, todas las páginas deben compartir una navegación común visible para moverse entre secciones sin usar el botón atrás. Segundo: rediseñar la apariencia visual de toda la aplicación para que resulte profesional y sobria: tipografía consistente, paleta de colores limitada definida en un único lugar, espaciado uniforme, jerarquía visual clara entre títulos, tablas, formularios y totales, y estados visuales distinguibles para los presupuestos (Borrador, Enviado, Aceptado, Rechazado, Caducado). El rediseño debe aplicarse también a la plantilla del PDF para que el documento que recibe el cliente transmita la misma imagen profesional. Debe mantenerse el enfoque mobile-first ya existente. La lógica de negocio, los cálculos, la API y el esquema de datos no deben cambiar en absoluto."

## Clarifications

### Session 2026-11-09

- Q: ¿Qué estados de presupuesto deben distinguirse visualmente? → A: Solo BORRADOR y COMPLETO (los existentes en la spec 001); Enviado, Aceptado, Rechazado y Caducado quedan fuera.
- Q: ¿Los nombres visibles de las secciones cambian a "Catálogo" y "Perfil" o se conservan "Servicios" y "Configuración"? → A: Se renombran a "Catálogo" y "Perfil" en la navegación, la página de inicio y los títulos de cada pantalla.
- Q: ¿Qué ocurre con los enlaces o favoritos antiguos a la dirección raíz, que hoy muestra el listado de presupuestos? → A: La raíz muestra la página de inicio; el listado de presupuestos tiene su propia dirección y se llega a él desde el inicio y la navegación.
- Q: ¿Debe mostrarse la navegación común en la pantalla que avisa que la aplicación ya está abierta en otra pestaña? → A: No; es la única excepción a FR-005 y conserva su aviso a pantalla completa con el nuevo estilo.
- Q: ¿Qué contraste mínimo entre texto y fondo debe cumplir toda la interfaz? → A: 4,5:1 para texto normal y 3:1 para texto grande y bordes de controles (nivel AA).
- Q: ¿Puede el PDF rediseñado añadir elementos nuevos que no estaban antes, como el número de página? → A: No; el PDF conserva exactamente los mismos textos y datos y solo cambia el estilo.
- Q: ¿Cómo debe comportarse la barra de navegación común de cinco secciones en un teléfono de 360 px? → A: Las cinco secciones visibles a la vez, repartiendo el ancho; si no caben en una fila, pasan a una segunda fila (sin menú plegable ni desplazamiento interno).

## Contexto

Esta mejora es exclusivamente de **presentación** sobre la aplicación ya implementada en la spec 001 (`specs/001-presupuestos-pdf`). No cambia reglas de negocio, cálculos, datos guardados ni el contenido del PDF; solo cómo se ve y cómo se navega.

- **Usuario**: el mismo profesional independiente de la spec 001, que usa la aplicación principalmente desde el teléfono y también desde el computador.
- **Secciones existentes**: Presupuestos, Clientes, Catálogo (los servicios de la spec 001) y Perfil (los datos profesionales y la configuración fiscal de la spec 001).
- **Destinatario del PDF**: el cliente del profesional, que recibe el documento por su cuenta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Llegar a una página de inicio con acceso claro a todo (Priority: P1)

Al abrir la aplicación, el profesional ve una página de inicio que le da la bienvenida, le muestra un resumen de su actividad y le ofrece accesos claros a Presupuestos, Clientes, Catálogo y Perfil.

**Why this priority**: es el punto de entrada y el cambio más visible; ordena el uso de la aplicación sin tocar su funcionamiento.

**Independent Test**: abrir la dirección raíz de la aplicación y comprobar que aparece la página de inicio con los cuatro accesos y el resumen; pulsar cada acceso y verificar que lleva a la sección correcta.

**Acceptance Scenarios**:

1. **Given** la aplicación abierta en su dirección raíz, **When** carga, **Then** se muestra la página de inicio (no el listado de presupuestos) con cuatro accesos: Presupuestos, Clientes, Catálogo y Perfil.
2. **Given** el profesional tiene presupuestos guardados, **When** ve la página de inicio, **Then** el resumen muestra cuántos presupuestos hay en cada estado existente y el total de presupuestos.
3. **Given** el profesional no tiene presupuestos, **When** ve la página de inicio, **Then** el resumen muestra cero en cada estado y un acceso evidente para crear su primer presupuesto.
4. **Given** la página de inicio, **When** el profesional pulsa un acceso, **Then** llega a la sección elegida con todos sus datos intactos.

---

### User Story 2 - Navegar entre secciones desde cualquier página (Priority: P1)

En todas las páginas de la aplicación (inicio, listados, formularios, edición y vista de un presupuesto) hay una navegación común visible que permite pasar a cualquier sección sin usar el botón atrás del navegador, e indica en qué sección se encuentra el usuario.

**Why this priority**: sin ella, las secciones nuevas y las existentes siguen siendo difíciles de recorrer; es la base de la mejora de uso.

**Independent Test**: desde cada página, usar la navegación común para llegar a las otras cuatro secciones sin pulsar el botón atrás.

**Acceptance Scenarios**:

1. **Given** cualquier página de la aplicación, **When** se muestra, **Then** la navegación común es visible y destaca la sección actual.
2. **Given** el usuario está en una pantalla pequeña (teléfono), **When** usa la navegación, **Then** todas las secciones son alcanzables y los controles se pueden pulsar cómodamente.
3. **Given** un borrador con cambios sin guardar, **When** el usuario usa la navegación común para salir, **Then** sigue apareciendo la advertencia de cambios sin guardar de la spec 001 (FR-005).
4. **Given** el usuario está en una sección, **When** pulsa el acceso a la página de inicio desde la navegación, **Then** vuelve al inicio.

---

### User Story 3 - Apariencia visual profesional y consistente (Priority: P1)

Toda la aplicación se ve sobria y coherente: misma tipografía, pocos colores, espaciado uniforme, y una jerarquía clara entre títulos, tablas, formularios y totales. Los presupuestos muestran su estado con una distinción visual inconfundible.

**Why this priority**: es el segundo gran objetivo de la mejora y condiciona la percepción de calidad de todo el producto.

**Independent Test**: recorrer todas las pantallas en teléfono y en computador y comprobar que comparten el mismo estilo y que cada estado de presupuesto se reconoce de un vistazo.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla, **When** se observa, **Then** usa la misma tipografía, la misma paleta limitada y el mismo espaciado que las demás.
2. **Given** una pantalla con título, tabla, formulario y totales, **When** se observa, **Then** el orden de importancia visual es evidente: los títulos destacan sobre el contenido, y los totales destacan sobre las líneas.
3. **Given** presupuestos en distintos estados, **When** se ven en el listado y en su detalle, **Then** cada estado tiene una etiqueta visual distinta, legible y no basada solo en el color.
4. **Given** cualquier pantalla, **When** se abre en un teléfono, **Then** el contenido es legible y utilizable sin desplazamiento horizontal.
5. **Given** el cambio de apariencia, **When** el profesional usa cualquier función de la spec 001, **Then** funciona exactamente igual que antes y sus datos y totales no cambian.

---

### User Story 4 - PDF con la misma imagen profesional (Priority: P2)

El PDF que recibe el cliente adopta la misma identidad visual (tipografía, colores, jerarquía) que la aplicación, sin cambiar la información que contiene.

**Why this priority**: refuerza la imagen profesional ante el cliente final, pero depende de definir antes la identidad visual (historia 3).

**Independent Test**: descargar el PDF de un presupuesto COMPLETO y verificar que su estilo es coherente con la aplicación y que el contenido y los totales son idénticos a los de antes.

**Acceptance Scenarios**:

1. **Given** un presupuesto COMPLETO, **When** se descarga el PDF, **Then** usa la tipografía y la paleta de la aplicación, con títulos, tabla de líneas y totales claramente jerarquizados.
2. **Given** un presupuesto COMPLETO, **When** se compara el PDF nuevo con el anterior, **Then** contienen exactamente la misma información, importes, formatos y fechas.
3. **Given** un presupuesto con muchas líneas, **When** se descarga, **Then** el PDF se reparte en varias páginas sin perder legibilidad ni coherencia visual.
4. **Given** un profesional sin logo, **When** se descarga el PDF, **Then** el documento se ve completo y equilibrado sin el logo.

---

### Edge Cases

- **Aplicación sin datos**: la página de inicio y los listados deben verse bien y guiar al usuario cuando no hay presupuestos, clientes ni servicios.
- **Muchos presupuestos**: el resumen de inicio muestra cantidades correctas aunque sean cientos; no se trunca ni se desborda.
- **Direcciones directas existentes**: cualquier dirección usada antes (p. ej., la de un presupuesto concreto) sigue llevando a la misma pantalla; la raíz, que antes mostraba el listado, ahora muestra el inicio.
- **Segunda pestaña**: el aviso de aplicación abierta en otra pestaña (spec 001, FR-006) mantiene su comportamiento, adopta el nuevo estilo y no muestra la navegación común (excepción de FR-005).
- **Pantallas muy angostas**: la navegación común y las tablas siguen siendo utilizables sin desplazamiento horizontal de toda la página.
- **Textos largos** (nombres de cliente, descripciones): no rompen el diseño ni se salen de su espacio en la aplicación ni en el PDF.
- **Tildes y ñ**: se siguen viendo correctamente en la nueva tipografía, en la aplicación y en el PDF.

## Requirements *(mandatory)*

### Functional Requirements

**Página de inicio y navegación**

- **FR-001**: Al acceder a la dirección raíz de la aplicación, el sistema MUST mostrar una página de inicio como punto de entrada.
- **FR-002**: La página de inicio MUST ofrecer accesos claros a las cuatro secciones: Presupuestos, Clientes, Catálogo y Perfil. Estos nombres MUST usarse de forma idéntica en la navegación común, la página de inicio y los títulos de cada pantalla; la sección que antes se llamaba "Servicios" pasa a llamarse "Catálogo" y la que se llamaba "Configuración" pasa a llamarse "Perfil" (solo cambia el nombre visible, no su contenido ni su función).
- **FR-003**: La página de inicio MUST mostrar un resumen de actividad con el número de presupuestos por cada estado existente y el total, calculado a partir de los datos guardados y consistente con el listado de presupuestos.
- **FR-004**: Cuando no haya presupuestos, la página de inicio MUST mostrar cero en el resumen y un acceso evidente para crear un presupuesto.
- **FR-005**: Todas las páginas de la aplicación, excepto el aviso de aplicación abierta en otra pestaña (que no permite editar y se muestra a pantalla completa sin navegación), MUST mostrar una navegación común visible que permita ir a Inicio, Presupuestos, Clientes, Catálogo y Perfil sin usar el botón atrás, e indicar la sección actual. En pantallas estrechas (360 px) las cinco secciones MUST permanecer visibles a la vez, repartiendo el ancho y pasando a una segunda fila si no caben en una; no se usa menú plegable ni desplazamiento interno de la barra.
- **FR-006**: La navegación común MUST respetar las advertencias de cambios sin guardar de la spec 001 (FR-005).
- **FR-007**: El listado de presupuestos MUST seguir disponible como sección propia (Presupuestos), con su propia dirección distinta de la raíz, accesible desde la página de inicio y la navegación común, y con la misma información y acciones que en la spec 001. La dirección raíz MUST mostrar siempre la página de inicio.
- **FR-008**: Las direcciones directas existentes a presupuestos concretos (edición y vista), clientes y demás secciones MUST seguir funcionando. La única dirección cuyo destino cambia es la raíz, que pasa del listado al inicio.

**Apariencia visual**

- **FR-009**: Toda la aplicación MUST usar una tipografía consistente, con tamaños y pesos definidos para cada nivel (títulos, subtítulos, texto, notas).
- **FR-010**: La aplicación MUST usar una paleta de colores limitada y sobria, definida en un único lugar para que un cambio de color se refleje en toda la aplicación.
- **FR-011**: La aplicación MUST usar una escala de espaciado uniforme en márgenes, separaciones y rellenos.
- **FR-012**: La jerarquía visual MUST distinguir claramente títulos, tablas, formularios y totales; los totales de un presupuesto MUST destacar sobre las líneas.
- **FR-013**: Cada uno de los dos estados existentes (BORRADOR y COMPLETO) MUST tener una etiqueta visual propia y distinguible, legible sin depender solo del color, en el listado, el detalle y la página de inicio. No se introducen otros estados (enviado, aceptado, rechazado, caducado), que la spec 001 excluye.
- **FR-014**: Los mensajes de error, advertencias y confirmaciones MUST tener un estilo visual coherente y distinguible entre sí.
- **FR-015**: Los textos de la interfaz MUST cumplir un contraste mínimo con su fondo de 4,5:1 para texto normal y de 3:1 para texto grande (desde 18 pt, o 14 pt en negrita) y para los bordes de los controles; los controles interactivos MUST medir al menos 44 px de alto en pantallas táctiles.
- **FR-016**: El diseño MUST mantener el enfoque mobile-first: toda pantalla MUST ser plenamente utilizable en teléfono y adaptarse a pantallas más grandes sin pérdida de funcionalidad.

**PDF**

- **FR-017**: La plantilla del PDF MUST adoptar la misma tipografía, paleta y jerarquía visual que la aplicación.
- **FR-018**: El contenido, los importes, los formatos de moneda y fecha, el título **PRESUPUESTO** y el nombre de archivo del PDF MUST permanecer idénticos a lo definido en la spec 001 (FR-041 a FR-044). No se añaden elementos de contenido nuevos (p. ej., numeración de páginas o pies); el rediseño se limita a tipografía, color, alineación, relleno, líneas y separaciones.
- **FR-019**: La previsualización del PDF MUST seguir mostrando exactamente lo mismo que el documento descargado, con el nuevo estilo.

**Sin cambios funcionales**

- **FR-020**: Esta mejora MUST NOT modificar reglas de negocio, cálculos, validaciones, datos guardados ni el comportamiento de ninguna funcionalidad de la spec 001; los datos existentes MUST seguir disponibles sin migración ni pérdida.

### Key Entities

Esta mejora no crea ni modifica entidades de datos. Introduce solo conceptos de presentación:

- **Resumen de actividad**: conteo de presupuestos por estado y total, derivado de los presupuestos ya guardados; no se almacena.
- **Identidad visual**: conjunto único de tipografía, colores y espaciados compartido por la aplicación y el PDF.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al abrir la dirección raíz, el 100 % de las veces aparece la página de inicio con los cuatro accesos y el resumen.
- **SC-002**: Desde cualquier página, el profesional llega a cualquiera de las cinco secciones (Inicio, Presupuestos, Clientes, Catálogo, Perfil) en un solo toque o clic, sin usar el botón atrás.
- **SC-003**: Los números del resumen de inicio coinciden al 100 % con los presupuestos que muestra el listado, comprobable contando manualmente.
- **SC-004**: Al recorrer todas las pantallas, una persona no técnica confirma que en el 100 % de ellas se ve la misma familia tipográfica, los mismos colores y el mismo espaciado, y que los títulos destacan sobre los textos y los textos sobre las notas.
- **SC-005**: Una persona no técnica identifica el estado de un presupuesto de un vistazo (menos de 2 segundos) en el listado y en el detalle.
- **SC-006**: Todas las pantallas se usan en un teléfono (ancho de 360 px) sin desplazamiento horizontal de la página y con todas las acciones alcanzables.
- **SC-007**: Un presupuesto COMPLETO descargado conserva exactamente los mismos textos, importes y fechas que antes del rediseño, y cumple la jerarquía visual de FR-017: título PRESUPUESTO en el color de marca con línea de acento, cabecera de tabla rellena, filas separadas por líneas suaves y fila TOTAL resaltada.
- **SC-008**: Tras el rediseño, todos los flujos de la spec 001 (crear, guardar borrador, completar, previsualizar, descargar, gestionar clientes y catálogo) se completan igual que antes y con los mismos resultados.
- **SC-009**: Un cambio de color de marca se refleja en toda la aplicación modificando un solo lugar de definición.
- **SC-010**: Todos los pares de color de texto y fondo de la aplicación cumplen los contrastes mínimos de FR-015, comprobable con cualquier medidor de contraste.

## Assumptions

- "Catálogo" corresponde a la sección de servicios y "Perfil" a la de datos profesionales y configuración fiscal de la spec 001; se renombran en toda la interfaz (ver Clarifications), sin cambiar su contenido. Los demás textos de la spec 001 que mencionen "Servicios" o "Configuración" como nombre de sección se entienden actualizados.
- La página de inicio es una pantalla nueva y el listado de presupuestos pasa a ser una sección accesible desde ella y desde la navegación; ambas conservan la información de la spec 001.
- El resumen de actividad se limita a conteos por estado y total (sin importes, gráficos ni reportes financieros, excluidos en la spec 001).
- Se mantiene el idioma español de Colombia, la moneda COP y los formatos de la spec 001 (constitución, Principio II).
- No se agregan tipografías ni imágenes que requieran conexión a Internet: la aplicación debe seguir funcionando sin conexión (spec 001, FR-003).
- El PDF conserva su contenido y estructura de datos; solo cambia su aspecto visual.
- No hay selección de tema (claro/oscuro) ni personalización de colores por el usuario; la paleta es única y de la aplicación.

## Out of Scope

- Cualquier cambio en reglas de negocio, cálculos, validaciones, datos guardados o esquema de datos.
- Nuevos estados de presupuesto o flujos asociados (enviado, aceptado, rechazado, caducado): la solicitud original los mencionaba, pero se decidió limitar el diseño a BORRADOR y COMPLETO para no alterar datos ni funcionalidad. Podrían proponerse en una spec futura.
- Nuevas funcionalidades en las secciones (reportes, gráficos, importes en el resumen, búsqueda, filtros).
- Selector de tema, modo oscuro, personalización de colores o de plantilla por el usuario.
- Múltiples plantillas de PDF o editor visual de plantillas.
- Contenido nuevo en el PDF (numeración de páginas, pies, marcas de agua); podría proponerse en una spec futura.
- Cambios de idioma, moneda o país.
