# Arquitectura prevista del MVP

Este documento fija las decisiones de implementación que atraviesan varias etapas del [plan de desarrollo](Plan_de_desarrollo.md). La [especificación maestra](Proyecto_general.md) conserva el detalle de jugabilidad y arte. Aquí se describe la estructura futura; **no existe todavía código del juego**.

## Catálogo y orden de las áreas

Cada época tendrá un `id` estable, independiente de su número y de la ubicación de su sala. El catálogo guardará nombre y artefacto; el contenido jugable se añadirá cuando se implemente la época. La lista `areaOrder` será la única fuente del orden.

| ID estable | Época | Artefacto | MVP |
| --- | --- | --- | --- |
| `roma` | Roma Antigua | Casco de gladiador | Jugable |
| `egipto` | Egipto Antiguo | Escarabajo egipcio | Jugable |
| `grecia` | Grecia Antigua | Corona de laurel | WIP |
| `babilonia` | Mesopotamia — Babilonia | Tablilla cuneiforme | WIP |
| `medieval` | Edad Media — Castillo medieval | Llave antigua | WIP |
| `renacimiento` | Renacimiento Italiano | Compás de artista | WIP |
| `japon` | Japón Feudal | Máscara de samurái | WIP |
| `paris_1830` | Revolución de Julio — París, 1830 | Escarapela tricolor | WIP |
| `titanic` | Titanic — 1912 | Reloj de bolsillo | WIP |
| `luna` | Llegada a la Luna — 1969 | Insignia Apollo 11 | WIP |

Un área pasa a ser jugable cuando aporta una exhibición con artefacto fotografiable, un mundo histórico, puntos de aparición, ubicación del artefacto final y una ruta transitable para la ayuda. El catálogo debe comprobar que cada ID de `areaOrder` existe y aparece una sola vez. Roma y Egipto usarán el mismo contrato; no habrá una versión independiente de la mecánica para cada una.

## Salas, estados y progresión

- El edificio ofrece diez módulos físicos fijos. Cada módulo recibe el contenido de la época situada en esa posición de `areaOrder`. La geometría de una exhibición se define respecto del origen local de su módulo; moverla no requiere editar coordenadas globales.
- Número de sala, señalización, posición en el panfleto y luz de área se calculan a partir del índice en `areaOrder`. Por ejemplo, mover `egipto` al octavo lugar debe bastar para actualizar los cuatro aspectos.
- **Disponibilidad** (`WIP` o jugable) y **progreso** (`locked`, `active`, `completed`) son conceptos distintos. Una sala WIP se puede visitar, pero no contiene viaje temporal y nunca se vuelve `active`.
- Solo una época jugable incompleta está activa a la vez: la primera de `areaOrder` que no esté completada. Las WIP se saltan. Si no queda ninguna jugable incompleta, no hay área activa y se muestra la conclusión correspondiente al contenido disponible.
- Una foto válida inicia el viaje, pero el área solo se marca como completada al interactuar con el artefacto en el mundo histórico y regresar. La foto y la representación del artefacto se añaden juntas al panfleto en ese momento.

## Fotografía y escenas

- El encuadre visible y la cámara usada para capturar deben compartir posición, orientación y proyección. En el instante del disparo se renderiza la escena real a una imagen; la transición comienza después de conservar esa imagen.
- La validación proyecta el artefacto al encuadre y comprueba visibilidad con rayos frente a la geometría sólida. No exige que esté centrado. La misma función sirve para casco, escarabajo y futuras áreas.
- Una foto inválida produce su Polaroid, termina el revelado y devuelve el control sin avanzar. Una válida muestra el revelado y después carga el mundo de la época activa.
- Museo y mundo histórico comparten los sistemas de jugador, interacción y presentación. Al entrar en un mundo se inicia el contador de 20 segundos; si aún no se recogió el artefacto, se muestra una guía tenue a lo largo de una ruta transitable. Al salir se detiene y se retira esa guía.
- Mantener escenas y recursos separados para cargar el mundo activo y liberar el anterior. Esto evita que las diez salas obliguen a mantener varios escenarios históricos en memoria.

## Estado de partida y controles

La experiencia necesita estados explícitos para inicio, exploración del museo, revelado, transición, exploración histórica, regreso y cierre del MVP. Cámara equipada, panfleto abierto y pausa se gestionan como modos compatibles con esos estados. Durante el revelado y las transiciones se deshabilitan movimiento y disparo; al cerrar una interfaz se recupera Pointer Lock solo mediante la acción del jugador.

El guardado local tendrá versión y usará IDs estables: panfleto recibido, áreas completadas y fotos válidas asociadas a cada área. Las capturas guardadas se reducirán de tamaño para no saturar el almacenamiento del navegador. El orden **no** se guardará en la partida: al recargar se toma el `areaOrder` actual y se reubican las áreas completadas en el panfleto. Reiniciar elimina el progreso guardado y comienza en el exterior.

## Pruebas de arquitectura obligatorias

1. Reordenar `egipto` del puesto 2 al 8 cambiando solo `areaOrder`: sala, letrero y panfleto se actualizan; tras completar Roma, Egipto sigue siendo la siguiente área activa.
2. Guardar Roma completada, cambiar el orden y recargar: la foto y el artefacto siguen asociados a `roma`.
3. Fotografiar un artefacto visible en un extremo del encuadre; repetir con el artefacto detrás de una pared: solo el primer disparo permite viajar.
4. Completar el artefacto histórico antes y después de los 20 segundos: la guía aparece únicamente en el segundo caso y nunca atraviesa paredes.
5. Abrir o cerrar panfleto y pausa alrededor de una transición: no quedan controles activos ni se pierde el estado de progreso.
