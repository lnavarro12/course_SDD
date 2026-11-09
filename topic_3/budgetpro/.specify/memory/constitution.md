<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0 (MAJOR: redefinición del Principio II)
- Principio modificado: II. Idioma y mercado (inglés/USD → español de Colombia/COP, normativa
  tributaria colombiana, sin selección de país)
- Ejemplo del Principio IV y sección Restricciones del producto: USD → COP / inglés → español
- Secciones añadidas: ninguna
- Secciones eliminadas: ninguna
- Plantillas dependientes: leen la constitución en tiempo de ejecución; no se modifican aquí.
- TODOs diferidos: ninguno
-->

# PresupuestosPro Constitution

## Core Principles

### I. Simplicidad ante todo

PresupuestosPro es una versión 1. Ante dos soluciones que cumplan la spec, se MUST elegir la
más simple (menos piezas, menos dependencias, menos pasos para el usuario).

- Se MUST NOT introducir abstracciones, capas, configuraciones ni infraestructura "por si acaso".
- Toda complejidad adicional MUST justificarse por escrito en el plan, indicando qué requisito
  de la spec la exige y por qué la alternativa simple no sirve.

**Razón**: la complejidad anticipada retrasa la entrega y encarece el mantenimiento de un
producto cuyo uso real aún no se conoce.

### II. Idioma y mercado

- Todo texto visible del producto (interfaz, mensajes, errores, PDF generado) MUST estar en
  español de Colombia.
- Todos los importes MUST expresarse en pesos colombianos (COP), con símbolo y formato
  consistentes en la app y en el PDF.
- Las reglas tributarias (IVA, retención en la fuente, identificación fiscal NIT/CC) MUST
  seguir la normativa de Colombia.
- Se MUST NOT ofrecer selección de idioma, de moneda ni de país en la v1.

**Razón**: un solo mercado, idioma y moneda eliminan ambigüedad y trabajo de localización.

### III. Cero alcance fantasma (NO NEGOCIABLE)

- Solo se MUST implementar funcionalidad escrita explícitamente en la spec vigente.
- Si durante el diseño o la implementación surge una idea nueva, se MUST registrar como
  propuesta (para una futura spec o enmienda) y NO se construye.
- Cualquier código, pantalla o campo que no pueda rastrearse a un requisito de la spec MUST
  eliminarse antes de dar la tarea por terminada.

**Razón**: el alcance no escrito no se puede verificar, estimar ni aprobar.

### IV. Verificable por una persona no técnica

- Cada criterio de éxito de una spec MUST poder comprobarse usando la app (o el PDF que
  genera), sin leer código, logs ni bases de datos.
- Cada criterio MUST redactarse como pasos observables y un resultado esperado concreto
  (p. ej., "al pulsar *Download PDF* se descarga un archivo con el total en COP").
- Un criterio que solo pueda validarse técnicamente MUST reescribirse o descartarse.

**Razón**: el freelancer es quien decide si el producto funciona; la validación debe estar a
su alcance.

### V. Datos del usuario con respeto

- La app MUST pedir solo los datos imprescindibles para generar el presupuesto; cada campo
  solicitado MUST justificarse con un requisito de la spec.
- Se MUST NOT incluir claves, tokens, contraseñas ni otros secretos en el código fuente ni en
  el repositorio; si se necesitan, MUST provenir de configuración externa (p. ej., variables
  de entorno).

**Razón**: menos datos implican menos riesgo y más confianza del usuario.

## Restricciones del producto

- Producto: herramienta web para que freelancers generen presupuestos en PDF.
- Mercado: Colombia. Idioma de la interfaz y del PDF: español. Moneda: COP.
- Alcance: exclusivamente lo descrito en las specs aprobadas (Principio III).

## Flujo de trabajo y puertas de calidad

- Toda funcionalidad nace en una spec; el plan y las tareas MUST derivarse de ella.
- Antes de implementar, el plan MUST pasar un chequeo contra esta constitución
  (Constitution Check) y documentar cualquier excepción de complejidad (Principio I).
- Una tarea solo se considera terminada cuando sus criterios de éxito se han comprobado
  usando la app, como lo haría una persona no técnica (Principio IV).
- Las ideas nuevas se recogen como propuestas, nunca como código (Principio III).

## Governance

- Esta constitución prevalece sobre cualquier otra práctica, spec, plan o tarea del proyecto.
  Ante un conflicto, se corrige el artefacto, no la constitución.
- Enmiendas: MUST proponerse por escrito con su motivo, aprobarse por la persona responsable
  del producto y registrarse actualizando versión y fecha.
- Versionado semántico:
  - MAJOR: eliminación o redefinición incompatible de un principio.
  - MINOR: principio o sección nueva, o ampliación material de una guía.
  - PATCH: aclaraciones, redacción o erratas sin cambio de significado.
- Cumplimiento: cada plan y cada revisión MUST verificar los cinco principios; las
  desviaciones MUST justificarse explícitamente o corregirse.

**Version**: 2.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05
