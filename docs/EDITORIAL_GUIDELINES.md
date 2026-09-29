# Guía editorial de DevPedia

Consultá esta guía antes de crear, editar o revisar contenido en español de DevPedia: guías (`src/content/guides/es/`), temas (`src/content/topics/es/`) y subtemas (`src/content/subtopics/es/`). El público son developers y software engineers. No asumas que conocen cada concepto, pero no expliques lo obvio.

## Voz, tono y audiencia

- Español rioplatense profesional, con voseo cuando corresponda (`decidí`, `tenés`, `corré`). No fuerces modismos ni un tono excesivamente informal.
- Conservá la voz del autor: directa, didáctica y técnicamente rigurosa.
- Evitá tono corporativo, académico innecesario, promocional o de texto generado automáticamente.
- Tomá los mejores pasajes existentes como referencia de estilo, sin reproducir sus errores.
- No reescribas un pasaje correcto solo por preferencia: cada cambio tiene que aportar una mejora identificable.

## Español e inglés

Elegí el término según precisión y uso natural entre profesionales de software de Argentina. No impongas traducir todo ni dejar todo en inglés.

**Conservá el inglés** cuando es el nombre del concepto, es más claro o es lo que se busca:

- nombres de patrones (Factory Method, Circuit Breaker, Bulkhead);
- roles y alias del catálogo: _wrapper_, _factory_, _handler_, _Creator_, cuando la guía de ese patrón los usa así;
- nombres de principios (SOLID, KISS, DRY, YAGNI);
- denominaciones de enfoques en inglés, con su escritura convencional: Domain-Driven Design, Test-Driven Development, Spec-Driven Development, Hexagonal Architecture, Onion Architecture, Clean Architecture, Event Sourcing;
- protocolos, APIs, comandos e identificadores (`POST /payments`, `/init`, `deny`, `CLAUDE.md`);
- términos de dominio asentados: timeout, endpoint, mock/stub/spy, throughput, SLO/SLI/SLA, trade-off, feedback, blast radius;
- feature como incremento de producto, feature flag, feature branch, o cómo se parte el código (por feature / _feature locality_);
- codebase para el código como conjunto (repositorio es git);
- schema de una base, de eventos o de un JSON;
- tooling cuando nombra el ecosistema alrededor de una tecnología (tooling de gRPC, tooling maduro de SQL);
- ownership del servicio, del dato o del equipo;
- scope de un cambio o de un archivo de config (`el scope se corrió`, `CLAUDE.md` por scope).

En patrones de diseño, no traduzcas _wrapper_ por envoltorio ni _factory_ por fábrica: se confunden con el ejemplo (un envoltorio de regalo) y con el uso habitual entre developers. «Envoltorio para regalo» como objeto de negocio sí puede ir en español.

**Preferí español** cuando es natural y no pierde precisión:

- despliegue (no deployment);
- reintento / reintentos (no retry, salvo el nombre del mecanismo en un heading o la primera mención);
- límites (no boundaries, salvo Bounded Context);
- acoplamiento (no coupling);
- funcionalidad para la capacidad de una clase, API o categoría de testing (testing no funcional), no como sinónimo automático de feature;
- herramientas para tools concretas de un producto (MCP, permisos de Claude), no para reemplazar tooling;
- alcance para la amplitud de un test o de una discusión; esquema para un diagrama. No uses repositorio cuando querés decir codebase.

En la primera aparición de un concepto clave, si ayuda a reconocerlo o buscarlo, introducí español + original: **contexto delimitado** (_Bounded Context_), reintento (_retry_), **pirámide de tests** (_test pyramid_).

Después de esa introducción, quedate con una forma dentro de la guía. La misma palabra no tiene que traducirse igual en todos los contextos: timeout se queda en inglés; retry en prosa suele ser reintento.

No traduzcas identificadores, nombres de APIs, flags, comandos ni nombres oficiales de productos o documentos.

**Estructura de la frase en español.** Que una frase contenga un término técnico en inglés no significa que toda la frase deba estar en inglés. Redactá en español la estructura —el verbo, la relación, la propiedad, la actividad— y conservá el término técnico cuando aporte precisión, reconocimiento o consistencia con el resto de la guía.

Distinguí una **denominación establecida** de una **frase descriptiva**. Conservá nombres como Domain-Driven Design, Factory Method, Bounded Context, Hexagonal Architecture o Circuit Breaker. Traducí las palabras que describen acciones, relaciones o propiedades alrededor de esos términos.

| Evitar | Preferir | Por qué |
|---|---|---|
| Aggregate design | Diseño de aggregates | *Diseño* es la actividad; *aggregate* es el concepto de DDD que usa la guía. |
| Aggregate boundaries | Límites de los aggregates | *Límites* es español natural; *aggregate* se conserva. |
| Relationships between Bounded Contexts | Relaciones entre Bounded Contexts | La relación va en español; Bounded Context es el nombre. |
| Context map | Mapa de contextos (_Context Map_) | *Mapa* describe el artefacto; el original entra en la primera mención. |
| Architectural drivers | Drivers de arquitectura | La guía ya nombra el concepto así; *drivers* se conserva. |
| un sequence diagram | un diagrama de secuencia | El tipo de diagrama tiene nombre en español. |
| decision node / merge node | nodo de decisión / nodo de fusión | Piezas de la notación UML, no identificadores del ejemplo. |
| Error budget | Presupuesto de error (_error budget_) | La description de la guía ya usa el español; el original se introduce una vez. |
| Service level indicator | indicador de nivel de servicio | La sigla SLI/SLO/SLA se queda; la expansión puede ir en español. |

Si la guía ya eligió una traducción clara y consistente —*agregado*, *evento de dominio*, *reintento*— no la reemplaces por inglés. Tampoco fuerces un híbrido cuando existe una expresión completamente en español que resulte natural y precisa (*diagrama de secuencia*, no *sequence diagram*).

No traduzcas un término de forma aislada sin revisar cómo se usa en la guía y en los contenidos relacionados del mismo tema. *Aggregate* se queda en la guía de DDD porque es el término elegido ahí; *evento de dominio* en el overview del tema no obliga a renombrar el building block **Domain event** dentro del catálogo táctico.

Mantener un término en inglés no implica agregarle mayúsculas: sigue **Mayúsculas y minúsculas**. timeout, retry y aggregate van en minúscula en el cuerpo; Bounded Context, Factory Method y Context Map conservan su denominación.

Este criterio vale para títulos, subtítulos, párrafos, listas, tablas, notas, captions y textos de diagramas. No aplica a nombres oficiales, citas textuales, identificadores ni ejemplos de código. En un diagrama, `Payment Service` o `retry ChargeCard()` se quedan si coinciden con el ejemplo; una etiqueta descriptiva (source of truth, Incoming Load, charges card) sí se redacta en español.

## Cursivas, código y énfasis

La cursiva identifica una expresión técnica en inglés incorporada a la prosa. No reemplaza una explicación cuando el concepto es nuevo para el lector.

**Usá cursiva** para expresiones técnicas en inglés, especialmente al introducirlas o definirlas: _god object_, _feature locality_, _Bounded Context_, _happy path_, _blast radius_. Si una expresión aparece muchas veces en una sección, destacala en la primera mención y usá texto normal en las siguientes. No alternes arbitrariamente.

El patrón español + original de la sección anterior convive con esta regla: el original va en cursiva en esa primera mención (_Bounded Context_, _retry_, _test pyramid_), y después queda en la forma elegida, sin volver a marcarla.

**No uses cursiva** para vocabulario habitual de DevPedia. Es una convención deliberada para facilitar la lectura. Lista breve:

software, backend, frontend, framework, testing, test, API, HTTP, REST, JSON, SQL, cloud, plugin, prompt, endpoint, timeout, mock, stub, spy, fake, throughput, trade-off, feedback, codebase, schema, tooling, ownership, scope, feature (como incremento de producto), cache, token, commit, log

**No uses cursiva** para nombres de productos, herramientas, lenguajes o marcas: Claude Code, Spring Boot, Java, GitHub.

**Backticks** para identificadores, clases, métodos, comandos, rutas y elementos de código: `BookingService`, `@Transactional`, `npm test`.

**Títulos y subtítulos.** No agregues cursiva a términos en inglés. Conservá su capitalización según **Mayúsculas y minúsculas**. El original puede ir entre paréntesis en el encabezado, en redonda (`Diseño estratégico (strategic design)`), o en la primera frase del cuerpo.

**Enlaces.** No agregues cursiva únicamente porque el texto del enlace esté en inglés.

**Negrita y cursiva.** Evitá combinarlas sobre un mismo término sin una necesidad concreta. El glosado **español** (_original_) sí las combina a propósito: la negrita marca el concepto en la prosa; la cursiva, el término en inglés.

**Preguntas y énfasis.** No pongas preguntas u oraciones completas en cursiva por defecto. Cuando una pregunta tenga una función didáctica, priorizá un párrafo separado y, si ayuda, una etiqueta breve en negrita:

> **Pregunta práctica:** ¿Hay partes de esta clase que cambiarían por motivos diferentes?

Conservá las cursivas que tengan otra función editorial válida: títulos de libros, contraste (_necesaria_ / _accidental_), alias de un patrón (_También llamado: Wrapper_). No las elimines indiscriminadamente.

**Metadatos.** No introduzcas marcas de formato en campos de texto plano (`title`, `description`, Open Graph, Twitter Cards). El `description` del frontmatter se renderiza como texto y se usa en SEO: un `*` o `_` ahí se vería literal.

## Modelo de contenido y frontmatter

La unidad editorial de DevPedia es la **guía** (*guide*). Las guías se organizan por estructura de conocimiento, no por fecha: tema → subtema opcional → guía, con secciones opcionales para agrupar guías dentro de un tema o subtema. Cada guía existe en las dos ediciones, en `src/content/guides/{es,en}/<tema>/[<subtema>/]<id>.mdx`.

```yaml
id: test-doubles            # identidad conceptual, igual en ES y EN
slug: dobles-de-test        # segmento de URL de esta edición
order: 5                    # posición pedagógica entre sus hermanos
topic: testing              # id del tema
subtopic:                   # id del subtema, si lo tiene (opcional)
section: unit-testing       # id de una sección declarada en el tema o subtema (opcional)
title: "Dobles de test: dummy, stub, spy, mock y fake"
description: "Qué función cumple cada tipo de doble y cómo elegir el adecuado para controlar las dependencias de una prueba."
created: 2026-08-04         # primera publicación; no se muestra como fecha principal
lastUpdated: 2026-08-04     # la fecha que ve el lector («Actualizado …»); nunca anterior a created
cover:                      # imagen social propia, 1200×630 (opcional; si falta, se usa la del tema o subtema)
```

- **`id`**: identidad conceptual y estable. En inglés, kebab-case, único dentro de su tipo de contenido y el mismo en las dos ediciones. Empareja ES ↔ EN, alimenta hreflang y analytics, y no cambia nunca. No lo derives del slug ni del título: un id puede coincidir con el slug en inglés, pero no depende de él.
- **`slug`**: segmento de URL localizado. Cada edición tiene el suyo, redactado en su idioma. Estable después del lanzamiento (ver **Slug y URL**).
- **`order`**: posición pedagógica dentro del padre directo (tema o subtema), única entre hermanos. No es identidad. La página del tema muestra las guías sin sección primero, después cada sección en el orden declarado y, dentro de cada una, por `order`; el anterior/siguiente de una guía sigue ese mismo recorrido.
- Las dos ediciones de una guía tienen que coincidir en `topic`, `subtopic`, `section` y `order`. `created` y `lastUpdated` pueden diferir.

Temas y subtemas son YAML en `src/content/{topics,subtopics}/{es,en}/<id>.yaml`, con `id`, `slug`, `order`, `title`, `description`, `icon` y `sections` opcionales (`{ id, title }`, en orden de lectura); un subtema agrega `topic`. El build falla si se rompe cualquiera de estas reglas.

Los enlaces internos apuntan a la URL de la misma edición, sin dominio (`/testing/dobles-de-test/`, `/en/testing/test-doubles/`). Nunca a `/blog/…`.

## Títulos y descriptions

Son el primer contacto con la guía, en el índice y al compartir el enlace (Open Graph y Twitter Cards leen `title` y `description` del frontmatter). La capitalización sigue **Mayúsculas y minúsculas**.

**Títulos**

- Claridad, naturalidad y atractivo. Expresá el concepto, la pregunta o el problema central.
- En español, mayúscula solo en la primera palabra, más nombres propios, nombres oficiales y siglas. No uses *title case* para dar importancia.
- Conservá los términos técnicos que permiten reconocer el tema (Factory Method, TDD, MCP). Si el título es el nombre de un patrón o de un enfoque, usá su denominación convencional.
- Evitá títulos genéricos, traducciones literales, enumeraciones innecesarias (`Foo: A, B y C`) y fórmulas repetitivas.
- No fuerces una pregunta cuando un título directo funciona mejor.
- Los nombres de patrón, protocolo o acrónimo se quedan como título: el summary hace el trabajo editorial.

**Descriptions**

- Cortas y claras: una oración, dos si hace falta. Si hay que recortar, recortá el inventario de temas, no la tesis. Una description breve que obliga a reconstruir el significado no es clara: falta una palabra, no sobra.
- Complementá el título; no lo repitas ni lo conviertas en un índice comprimido.
- El lector tiene que entender de qué se trata la guía sin haber leído nada más.
- No arranques por lo que el tema *no* es («DDD no es microservicios», «Cloud no es un inventario») salvo que esa negación sea el tema. Primero qué es o qué pregunta responde.
- Evitá metáforas y fórmulas sentenciosas («escalera de madurez», «cuesta más de lo que evita») cuando el significado no queda en una primera lectura.
- Generá interés con una tensión real o una decisión, sin clickbait.
- El sistema de ejemplo (AndesShop, ReservaResto, checkout, envío, mesas, `Order`) vive en el cuerpo, no en la preview.
- Título y description juntos tienen que funcionar en una preview de WhatsApp o LinkedIn.

**Slug y URL**

El slug público de una guía nueva tiene que coincidir con su título, no con un título anterior, un apodo ni un recorte. Si leés la URL, tenés que reconocer el título.

El slug no sale del nombre del archivo: es el campo `slug` del frontmatter (ver **Modelo de contenido y frontmatter**). La URL se arma con los slugs de la jerarquía: `/arquitectura/resiliencia-en-sistemas-distribuidos/`, `/diseno/patrones/factory-method/`. El archivo se llama como el `id` (`resilience-in-distributed-systems.mdx`) y no aparece en la URL.

Cómo se forma el slug a partir del título:

- minúsculas, sin tildes, espacios → guiones;
- se quitan `¿ ? ¡ !` y el resto de la puntuación de cierre;
- `:` y `,` separan y se vuelven guión (`Plugins: cómo empaquetar y compartir extensiones` → `plugins-como-empaquetar-y-compartir-extensiones`);
- se conservan artículos y preposiciones (`de`, `y`, `en`, `el`, `la`, `un`, `cómo` → `como`): el slug se lee como el título, no como una versión recortada;
- un acrónimo entre paréntesis que solo reitera el mismo nombre se omite: *Domain-Driven Design (DDD)* → `domain-driven-design`;
- un acrónimo que suma información se conserva: *Pruebas de aceptación de usuario (UAT)* → `pruebas-de-aceptacion-de-usuario-uat`; *F.I.R.S.T.: principios para tests unitarios* → `first-principios-para-tests-unitarios`.

Qué no vale:

- un nombre viejo del mismo contenido (`Skills, Subagentes y Hooks` no es `extendiendo-claude-code`);
- un recorte (`Cómo revisar un diseño de software` no es `heuristicas-practicas`; `Principios de diseño` no es `guias-de-diseno-de-software`);
- palabras que el título no tiene (`Testing` no es `software-testing`).

Las secciones (Patrones creacionales, Patrones estructurales, Patrones de comportamiento, Comparaciones y referencia) no tienen URL propia: agrupan guías dentro de la página del tema o subtema y se enlazan con un ancla (`/diseno/patrones/#creational`). Si una sección tiene una guía overview con el mismo nombre, esa guía sigue la misma regla título ↔ slug.

**Estabilidad después del lanzamiento.** Una vez publicada, una URL es estable. DevPedia no tiene redirecciones: cambiar un slug deja la URL anterior en 404. Por eso un ajuste de título no renombra el slug automáticamente. Un cambio solo de mayúsculas y minúsculas, o un ajuste menor, deja el slug como está. Si título y slug dejan de coincidir de verdad, renombrar es una decisión explícita: se cambia el `slug` (nunca el `id`) y se actualizan los enlaces internos de la misma edición. No dejes enlaces rotos (`npm run check:links`).

## Mayúsculas y minúsculas

En español, usá mayúscula solo en la primera palabra de títulos y encabezados, además de los nombres propios, nombres oficiales y siglas que correspondan. El tamaño, el peso tipográfico y la disposición visual establecen la jerarquía: no capitalices cada palabra para que un título «se vea más importante».

Aplicá el mismo criterio a categorías y páginas de temas, títulos de guías y subtítulos internos, cards, menús, breadcrumbs e índices, descriptions y summaries, tablas, listas, notas y textos de diagramas, y metadatos SEO y de redes (Open Graph y Twitter Cards).

Un mismo título conserva la misma escritura en el encabezado, las cards, los breadcrumbs, la navegación, los índices y los metadatos. Si el texto vive en una fuente compartida (el YAML del tema o subtema, incluidos los títulos de sus `sections`, o el frontmatter de la guía), corregí ahí para no duplicar divergencias. Revisá también las referencias escritas a mano en el cuerpo y en los enlaces internos.

| Actual | Corregido |
|---|---|
| Arquitectura de Software | Arquitectura de software |
| Principios de Diseño | Principios de diseño |
| Patrones de Diseño | Patrones de diseño |
| ¿Qué es la Arquitectura de Software? | ¿Qué es la arquitectura de software? |
| Arquitectura de la Aplicación | Arquitectura de la aplicación |
| Resiliencia en Sistemas Distribuidos | Resiliencia en sistemas distribuidos |
| Cómo Comunicar Decisiones de Arquitectura | Cómo comunicar decisiones de arquitectura |
| Atributos de Calidad (Requisitos No Funcionales) | Atributos de calidad (requisitos no funcionales) |
| Restricciones Técnicas | Restricciones técnicas |
| MCP: Conectar Herramientas Externas | MCP: conectar herramientas externas |
| Aggregate Design | Diseño de aggregates |
| Architectural Drivers: Qué Guía… | Drivers de arquitectura: qué guía las decisiones de arquitectura |
| Bounded Context ≠ Microservicio | Bounded Context ≠ microservicio |

Después de dos puntos y dentro de paréntesis, usá minúscula cuando continúe una frase descriptiva (`MCP: conectar herramientas externas`; `Atributos de calidad (requisitos no funcionales)`). Si lo que sigue es el nombre de un patrón o de un concepto establecido, conservá su denominación (`Wrappers: Adapter, Decorator, Proxy`; `Hexagonal vs. Onion vs. Clean`; `Bounded Context ≠ microservicio`).

**Excepciones y convenciones técnicas**

- Respetá los nombres oficiales de productos y tecnologías: Claude Code, Java, Spring Boot, GitHub, PostgreSQL.
- Conservá las siglas: SOLID, DDD, API, HTTP, MCP, TDD, SOA, ADR, UAT.
- Los nombres de patrones y de conceptos establecidos conservan su denominación convencional: Factory Method, Bounded Context, Domain-Driven Design, Single Responsibility Principle, Hexagonal Architecture, Event Sourcing, Circuit Breaker. La distinción no es que el término sea técnico, sino que se use como nombre de un concepto específico.
- Las frases descriptivas o las actividades usan sentence case: mayúscula solo en la primera palabra (`Diseño de aggregates`; `Drivers de arquitectura: qué guía las decisiones de arquitectura`). Si la frase mezcla español y un nombre establecido, la primera palabra en español lleva la mayúscula del encabezado (`Mapa de contextos`; `Relaciones entre Bounded Contexts`).
- Un nombre de una sola palabra (Observer, Strategy, Adapter, Bulkhead) ya es su denominación. Al combinarse con una palabra que no es ese nombre, esa segunda va en minúscula (`Observer ≠ pub/sub`; `Bounded Context ≠ microservicio`).
- Los lemas citados de un acrónimo pueden conservar su forma habitual: *Keep It Simple, Stupid*.
- Los títulos de libros conservan su capitalización original: *Domain-Driven Design: Tackling Complexity in the Heart of Software*.
- Los términos genéricos en inglés no llevan mayúscula por ser técnicos o estar en inglés: testing, performance, cloud, framework, deployment, load balancer. Usá mayúscula si comienzan un título o una oración, o si en ese uso son el nombre de un concepto (`API Gateway`, `Load Balancer` como patrón o componente nombrado en un heading).
- No modifiques identificadores de código, clases, métodos, comandos, rutas, nombres de configuración ni etiquetas de nodos en diagramas que coincidan con el ejemplo (`Payment Service`, `retry ChargeCard()`, `Load Balancer` en un diagrama).

**Cuerpo de la guía**

El criterio también vale dentro del texto. Un concepto técnico común en español se escribe en minúscula aunque esté en negrita o haya sido título de sección. Un nombre de patrón o de concepto establecido conserva su denominación.

- Encabezado: «Arquitectura de software»; «Bounded Context ≠ microservicio»; «Diseño de aggregates».
- Dentro de una oración: «Las decisiones de arquitectura de software…»; «Un Bounded Context puede desplegarse de varias formas».
- Mal: «Los **Atributos de Calidad** describen propiedades del sistema»; «**Bounded context ≠ microservicio**».
- Bien: «Los **atributos de calidad** describen propiedades del sistema»; «**Bounded Context ≠ microservicio**».

**Etiquetas visuales**

Etiquetas breves como el contador de guías o el rótulo del índice pueden verse en mayúsculas como recurso gráfico. Cuando sea posible, esa presentación va por CSS (`text-transform: uppercase`) y el texto fuente queda en escritura natural (`11 guías`, `en esta página`). No uses `text-transform: capitalize` para forzar mayúsculas en títulos. No cambies la identidad visual del sitio ni convenciones gráficas deliberadas, como los prefijos `//`.

Al cambiar un encabezado, comprobá que las anclas y los enlaces internos (`#…`) sigan válidos. El slugger del sitio pasa el texto a minúsculas, así que un ajuste solo de capitalización suele conservar el `id`; si no, conservá el identificador existente.

## Claridad, coherencia y profundidad

Priorizá una idea bien expresada por encima de una frase breve o ingeniosa.

- Usá construcciones directas y relaciones claras entre causas, acciones y consecuencias.
- No elimines palabras necesarias para entender el razonamiento.
- Evitá metáforas y fórmulas sentenciosas cuando vuelvan impreciso el significado.
- No confundas naturalidad con informalidad: palabras como «chico» o «caro» no hacen que una oración suene natural por sí solas.
- Buscá un tono de explicación entre colegas, sin frases que parezcan eslóganes.
- Conservá la precisión técnica y los matices. No conviertas una posibilidad en una regla general para darle más fuerza al texto.
- Introducí un concepto antes de usarlo, o indicá dónde se explica.
- Cada párrafo, una idea reconocible y una relación clara con el anterior.
- Si falta un paso de razonamiento, incorporá la explicación mínima para que se pueda seguir.
- No dejes afirmaciones vagas («mejora la escalabilidad», «reduce el acoplamiento») sin el mecanismo, una condición, una consecuencia o un ejemplo.
- Distinguí definición, recomendación y decisión que depende del contexto.
- Revisá absolutos: *siempre*, *nunca*, *garantiza*, *la mejor opción*. Conservá matices y trade-offs.
- No confundas brevedad con borrar información necesaria. Tampoco conviertas cada párrafo en una explicación extensa: agregá profundidad donde resuelve una duda real.
- No inventes datos, fuentes ni comportamientos. Si una corrección depende de algo técnico incierto, verificá documentación primaria o dejalo marcado como pendiente.

Antes de dar por terminada una reformulación, releela fuera de contexto: ¿se entiende en una primera lectura?, ¿queda claro qué se afirma?, ¿suena como algo que una persona diría al explicar este tema?

Mal: «Cada principio responde a un modo distinto de que un cambio chico se vuelva caro. Aplicarlos todos a rajatabla suele costar más de lo que evita.»

Bien: «Cada principio busca evitar que un cambio pequeño termine exigiendo mucho trabajo. Aplicarlos a rajatabla puede agregar más complejidad de la que resuelve.»

## Organización

- El subtítulo tiene que describir lo que desarrolla la sección.
- Dividí párrafos sobrecargados. Listas para elementos comparables o secuencias; prosa para razonamientos.
- Mantené paralelismo gramatical en las listas.
- Eliminá repeticiones que no aporten; conservá las recapitulaciones útiles.
- No uniformes todas las guías con una plantilla rígida.

## Independencia temporal y de lectura

La guía tiene que entenderse por sí mismo, independientemente de cuándo se lea y del orden en que el lector llegue a él.

**Qué corregir.** Expresiones propias de una clase, una entrega periódica o una conversación en vivo que no aportan información: «las tres piezas de hoy», «hoy vamos a ver…», «en esta entrega…», «como vimos la semana pasada…», «hasta acá veníamos hablando de…», «ahora le toca el turno a…», «el próximo artículo vemos…», «con esto cierra el recorrido». Evaluá cada caso en contexto. Reemplazá esas fórmulas por una referencia concreta al tema, explicá directamente la relación entre conceptos o eliminá la frase si no aporta nada.

Si el párrafo anterior ya expresa esa idea, eliminá la oración en lugar de repetirla. No reemplaces mecánicamente «hoy» por «aquí» o «en este artículo»: reformulá para que el texto aporte contenido concreto.

**Qué conservar.**

- Referencias útiles como «en este artículo» o «en la sección anterior» cuando orienten la lectura y su destino sea claro.
- Transiciones que expliquen una secuencia real de pasos o un razonamiento.
- Referencias temporales que aporten precisión técnica: fechas, versiones, cambios de comportamiento o contexto histórico.

**Cómo relacionar guías.** Nombrá el tema y agregá el enlace correspondiente, sin asumir que el lector ya lo leyó ni que va a seguir un orden fijo. «La [pirámide de tests](/testing/que-es-el-testing/#dónde-va-cada-test-la-pirámide)» alcanza; «que vimos en el primer artículo de este tema» no suma.

**«Actualmente», «recientemente», «en la última versión», «hoy».** Si importan para la afirmación, precisá la fecha o la versión con información verificable. No las borres si eso convierte una afirmación temporal en una verdad general: «la lista completa hoy supera los 30 eventos» no puede quedar como «la lista supera los 30 eventos» sin ancla. Un «hoy» que solo marca el momento de escritura o el de una clase, sí se reformula o se elimina.

| Evitar | Preferir | Por qué |
|---|---|---|
| «Las tres piezas de hoy especializan a Claude, pero no de la misma manera.» | «Skills, subagentes y hooks permiten extender Claude Code de distintas maneras.» | Nombra el tema; no depende de cuándo se lea. |
| «En la próxima guía vemos F.I.R.S.T.» | «[F.I.R.S.T.](/testing/first-principios-para-tests-unitarios/) es la regla mnemotécnica más usada para chequear si un unit test está bien pensado.» | Relaciona por el concepto y el enlace, no por un recorrido compartido. |
| «La lista completa hoy supera los 25-30 eventos» | «En septiembre de 2026 la lista oficial supera los 30 eventos» | La cifra cambia; sin fecha se lee como una verdad permanente. |

## Problemas recurrentes

Criterio, no reemplazo automático.

| Evitar | Preferir | Por qué |
|---|---|---|
| «Un monolito tiene un único deployment unit principal» | «Un monolito se despliega como una única unidad» | Calco; el español nombra la acción. |
| «Con estados pocos y transiciones simples» | «Con pocos estados y transiciones simples» | Orden natural. |
| «La invariante que el patrón existe para proteger» | «La invariante que el patrón busca preservar» | El patrón no «existe para»; busca preservar. |
| «Un patrón creacional: …» (todas las descriptions iguales) | El problema o la tensión que introduce el patrón | El tipo ya está en el título o en la categoría. |
| «timeout, retry, circuit breaker, idempotencia, bulkhead, saga…» como summary | «¿Cómo evitar que un fallo parcial se propague? Mecanismos, cuándo usarlos y qué no resuelven» | Un índice no da una razón para leer. |
| «Esto mejora la autonomía» | «Puede cambiar su esquema sin coordinar con los demás. El costo es que la transacción ya no es local» | El cómo y el costo. |
| «mejorar el acoplamiento» | «reducir el acoplamiento» | *Mejorar* se lee como aumentarlo. |
| AndesExpress / checkout / `Order` en el `description` | El mecanismo, sin el ejemplo local | El summary se lee fuera de la guía. |
| «Tres reportes, la misma secuencia, pasos distintos…» | «La clase base fija la secuencia; las subclases completan los pasos que varían» | La description tiene que decir de qué se trata, no reconstruir el ejemplo. |
| *envoltorio* / *fábrica* para el patrón | *wrapper* / *factory* | Es el nombre del concepto; *envoltorio* choca con el ejemplo de regalo. |
| «responde a un modo distinto de que un cambio chico se vuelva caro» | «busca evitar que un cambio pequeño termine exigiendo mucho trabajo» | Construcción rebuscada; *chico*/*caro* comprimen esfuerzo, complejidad y costo. |
| «suele costar más de lo que evita» | «puede agregar más complejidad de la que resuelve» | Compara magnitudes que el lector tiene que reconstruir; convierte un riesgo en regla. |

Otros calcos frecuentes a revisar en contexto: *bottleneck* → cuello de botella; *recovery* → recuperación (salvo *disaster recovery* / RPO / RTO, que se quedan o se introducen con el original); *sequence diagram* / *class diagram* → diagrama de secuencia / diagrama de clases; *source of truth* → fuente de verdad.

No traduzcas por sistema feature, codebase, schema, tooling, ownership ni scope: en el habla tech rioplatense suelen quedar mejor en inglés. Funcionalidad no siempre sustituye a feature. En el cuerpo, esos términos habituales van en redonda; ver **Cursivas, código y énfasis**.

Excepción: en diagramas Mermaid y en código, los identificadores pueden quedar en inglés si coinciden con el ejemplo (`Payment Service`, `retry ChargeCard()`).

## Qué no tocar en una pasada editorial

- Lógica de los ejemplos de código.
- Imports, componentes MDX, anclas internas.
- Slugs que ya coinciden con el título. Si no coinciden, sí se corrigen (ver **Archivo, slug y URL**).
- Nombres oficiales de productos, flags y APIs.
- Un pasaje que ya está claro, natural y preciso.
- Identificadores de código, comandos, rutas y nombres de configuración: no les apliques reglas de redacción.

## Checklist

Antes de dar por cerrado una guía nueva o una edición:

1. ¿El título nombra el tema sin ser un índice ni clickbait?
2. ¿La description es corta, se entiende sola y dice de qué se trata la guía — sin el sistema de ejemplo?
3. ¿Título, subtítulos, tema, cards, breadcrumbs y metadatos usan mayúscula solo en la primera palabra, más nombres propios, oficiales y siglas? ¿Los conceptos en el cuerpo están en minúscula aunque vayan en negrita?
4. ¿Open Graph / Twitter van a mostrar ese título y esa description? (salen del frontmatter.)
5. ¿Los conceptos se introducen antes de usarse, con español + inglés en la primera mención cuando ayuda?
6. ¿deployment / retry / boundaries / coupling están en español cuando el español es más natural? ¿feature / codebase / schema / tooling / ownership / scope quedaron en inglés cuando es lo que se usa? En patrones: ¿_wrapper_ y _factory_ quedaron en inglés? ¿La estructura de la frase está en español, aunque conserve el término técnico (`Diseño de aggregates`, no `Aggregate design`)?
7. ¿Las expresiones técnicas en inglés llevan cursiva al introducirlas, y no en cada repetición de la sección? ¿El vocabulario habitual (software, backend, testing, API, HTTP, timeout, codebase…) quedó en redonda? ¿No hay cursiva en títulos, marcas, identificadores ni metadatos? ¿Las preguntas didácticas van en un párrafo aparte, no en cursiva?
8. ¿Cada afirmación de beneficio dice cómo, por qué o bajo qué condición?
9. ¿La frase se entiende fuera de contexto, en una primera lectura, sin reconstruir el significado?
10. ¿Hay absolutos o eslóganes que convierten una posibilidad en regla?
11. ¿Las transiciones explican la relación entre ideas, sin conectores vacíos?
12. ¿El texto se entiende sin asumir cuándo se escribió ni en qué orden se lee? ¿Las fórmulas de clase, entrega o momento de escritura se reemplazaron por el tema concreto, se fecharon, o se eliminaron?
13. ¿Los subtítulos describen la sección?
14. ¿El slug (tema, subtema, guía y, si aplica, el overview de una categoría) coincide con el título actual — no un recorte ni un nombre anterior?
15. ¿Los enlaces internos siguen válidos (URL, no solo el texto del ancla)?
16. ¿El código y los identificadores quedaron intactos?
