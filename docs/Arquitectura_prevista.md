# Arquitectura prevista del MVP

Este documento fija las decisiones de implementación que atraviesan varias etapas del [plan de desarrollo](Plan_de_desarrollo.md). La [especificación maestra](Proyecto_general.md) conserva el detalle de jugabilidad y arte. Ya existen el [estudio visual](Revision_etapa_1.md), el [movimiento](Revision_etapa_2.md), el [inicio en el museo](Revision_etapa_3.md), una [prueba aislada de la Polaroid](Revision_etapa_4.md), las [diez salas del circuito en U](Revision_etapa_5.md) y el [ciclo romano](Revision_etapa_6.md). El laboratorio temporal de fotografía ya fue retirado. El catálogo y `areaOrder` alimentan la ubicación física, la señalización y el panfleto. Roma integra captura, viaje y progreso; Egipto y la persistencia siguen previstos para la etapa 7.

## Catálogo y orden de las áreas

Cada época tiene un `id` estable, independiente de su número y de la ubicación de su sala. El catálogo guarda nombre, artefacto previsto, color y disponibilidad. Roma tiene disponibilidad `playable`; las otras nueve áreas, incluido Egipto, siguen `wip` en la etapa 6. La lista `areaOrder` es la única fuente del orden.

| ID estable | Época | Artefacto | MVP |
| --- | --- | --- | --- |
| `roma` | Roma Antigua | Casco de gladiador | Jugable |
| `egipto` | Egipto Antiguo | Escarabajo egipcio | Previsto en etapa 7 |
| `grecia` | Grecia Antigua | Corona de laurel | WIP |
| `babilonia` | Mesopotamia — Babilonia | Tablilla cuneiforme | WIP |
| `medieval` | Edad Media — Castillo medieval | Llave antigua | WIP |
| `renacimiento` | Renacimiento Italiano | Compás de artista | WIP |
| `japon` | Japón Feudal | Máscara de samurái | WIP |
| `paris_1830` | Revolución de Julio — París, 1830 | Escarapela tricolor | WIP |
| `titanic` | Titanic — 1912 | Reloj de bolsillo | WIP |
| `luna` | Llegada a la Luna — 1969 | Insignia Apollo 11 | WIP |

Un área pasa a ser jugable cuando aporta una exhibición con artefacto fotografiable, un mundo histórico, puntos de aparición, ubicación del artefacto final y una ruta transitable para la ayuda. El catálogo comprueba que cada ID de `areaOrder` existe y aparece una sola vez. Roma y Egipto usarán el mismo contrato; no habrá una versión independiente de la mecánica para cada una.

## Salas, estados y progresión

Las medidas físicas compartidas viven en [museumLayout.ts](../src/museumLayout.ts): ancho exterior, límites del hall, paso y centros de las alas, altura de muros y nivel de suelo. Hall, galería, envolvente exterior y detección de ubicación utilizan esas referencias. Las salas mantienen 10,8 × 16 unidades; el hall ocupa el ancho completo del edificio y conecta sus dos pasillos laterales con las puertas del circuito.

- En la etapa 3 solo existía el hall y un umbral cerrado hacia el futuro sector romano. La etapa 5 ubica diez módulos en una U: cinco de ida, un cruce al fondo y cinco de regreso. Cada módulo recibe el ID situado en esa posición de `areaOrder`; su grupo local permite incorporar una exhibición sin fijarla a coordenadas globales. La primera puerta se abre con E y enciende la sala con un breve parpadeo. Las posteriores requieren la finalización de la sala precedente.
- Número de sala, señalización y posición en el panfleto se calculan a partir de `areaOrder`. El texto de disponibilidad de sala y panfleto se deriva del catálogo. Una prueba anterior movió `egipto` al octavo lugar y actualizó sala, letrero y panfleto, pero ese orden ya no es recorrible con las puertas WIP cerradas. Necesita un acceso alternativo antes de usarse en el juego.
- **Disponibilidad** (`WIP` o jugable) y **progreso** (`locked`, `active`, `completed`) son conceptos distintos. Una sala WIP tiene posición física y señalización, pero permanece cerrada y nunca se vuelve `active`.
- Solo una época jugable incompleta está activa a la vez: la primera de `areaOrder` que no esté completada. En la etapa 6 esa época es Roma; al instalar Egipto en la etapa 7, ambas quedarán contiguas en el orden inicial. La conclusión del MVP cuando no quede ninguna jugable incompleta sigue prevista para la etapa 7.
- Una foto válida inicia el viaje, pero el área solo se marca como completada al interactuar con el artefacto en el mundo histórico y regresar. La foto y la representación del artefacto se añaden juntas al panfleto en ese momento.
- En la etapa 6 el progreso de Roma y su foto permanecen en memoria durante la sesión; el guardado local por ID se implementará en la etapa 7.

## Fotografía y escenas

- El encuadre visible y la cámara usada para capturar deben compartir posición, orientación y proyección. En el instante del disparo se renderiza la escena real a una imagen; la transición comienza después de conservar esa imagen.
- La validación proyecta el artefacto al encuadre y comprueba visibilidad con rayos frente a la geometría sólida. No exige que esté centrado. La misma función sirve para casco, escarabajo y futuras áreas.
- Una foto inválida produce su Polaroid, termina el revelado y devuelve el control sin avanzar. Una válida muestra el revelado y después carga el mundo de la época activa.
- Museo y mundo histórico comparten los sistemas de jugador, interacción y presentación. Al entrar en un mundo se inicia el contador de 20 segundos; si aún no se recogió el artefacto, se muestra una guía tenue a lo largo de una ruta transitable. Al salir se detiene y se retira esa guía.
- Mantener escenas y recursos separados para cargar el mundo activo y liberar el anterior. Esto evita que las diez salas obliguen a mantener varios escenarios históricos en memoria.

## Estado de partida y controles

La experiencia necesita estados explícitos para inicio, exploración del museo, revelado, transición, exploración histórica, regreso y cierre del MVP. Cámara equipada, panfleto abierto y pausa se gestionan como modos compatibles con esos estados. El panfleto actual se maneja solo con M y conserva Pointer Lock mientras bloquea movimiento y mirada; Escape abre la pausa y lo libera. Si el puntero fue liberado, volver a capturarlo requiere una acción del jugador. Durante el revelado y las transiciones se deshabilitan movimiento y disparo.

Shift acelera el movimiento en exploración del museo y de Roma. La carrera se detiene al soltar la tecla y no queda retenida al abrir el panfleto, pausar o iniciar una transición.

El guardado local tendrá versión y usará IDs estables: panfleto recibido, áreas completadas y fotos válidas asociadas a cada área. Las capturas guardadas se reducirán de tamaño para no saturar el almacenamiento del navegador. El orden **no** se guardará en la partida: al recargar se toma el `areaOrder` actual y se reubican las áreas completadas en el panfleto. Reiniciar elimina el progreso guardado y comienza en el exterior.

## Pruebas de arquitectura obligatorias

1. Reordenar `egipto` del puesto 2 al 8 cambiando solo `areaOrder`: sala, letrero y panfleto se actualizan. El acceso jugable queda pendiente de una ruta que evite las salas WIP cerradas; no ofrecer ese orden hasta resolverlo.
2. Guardar Roma completada, cambiar el orden y recargar: la foto y el artefacto siguen asociados a `roma`.
3. Fotografiar un artefacto visible en un extremo del encuadre; repetir con el artefacto detrás de una pared: solo el primer disparo permite viajar.
4. Completar el artefacto histórico antes y después de los 20 segundos: la guía aparece únicamente en el segundo caso y nunca atraviesa paredes.
5. Abrir o cerrar panfleto y pausa alrededor de una transición: no quedan controles activos ni se pierde el estado de progreso.
