# Arquitectura prevista del MVP

Este documento fija las decisiones de implementación que atraviesan varias etapas del [plan de desarrollo](Plan_de_desarrollo.md). La [especificación maestra](Proyecto_general.md) conserva el detalle de jugabilidad y arte. Ya existen el [estudio visual](Revision_etapa_1.md), el [movimiento](Revision_etapa_2.md), el [inicio en el museo](Revision_etapa_3.md), una [prueba aislada de la Polaroid](Revision_etapa_4.md), el [circuito original de la etapa 5](Revision_etapa_5.md), ahora reducido a cinco salas visitables y el [ciclo romano](Revision_etapa_6.md). El laboratorio temporal de fotografía ya fue retirado. El catálogo y `areaOrder` alimentan la ubicación física, la señalización y el panfleto. La etapa 7 incorpora Egipto, el guardado local, reinicio y cierre con dos recuerdos.

## Catálogo y orden de las áreas

Cada época tiene un `id` estable, independiente de su número y de la ubicación de su sala. El catálogo guarda nombre, artefacto previsto, color y disponibilidad. Egipto y Roma tienen disponibilidad `playable`; Medieval, Japón y Luna siguen `wip`. La lista `areaOrder` es la única fuente del orden.

| ID estable | Época | Artefacto | MVP |
| --- | --- | --- | --- |
| `egipto` | Antiguo Egipto | Escarabajo egipcio | Jugable |
| `roma` | Antigua Roma | Casco de gladiador | Jugable |
| `medieval` | Edad Media — Castillo medieval | Llave antigua | WIP |
| `japon` | Japón Feudal | Máscara de samurái | WIP |
| `luna` | Llegada a la Luna — 1969 | Insignia Apollo 11 | WIP |

Un área pasa a ser jugable cuando aporta una exhibición con artefacto fotografiable, un mundo histórico, puntos de aparición, ubicación del artefacto final y una ruta transitable para la ayuda. El catálogo comprueba que cada ID de `areaOrder` existe y aparece una sola vez. Roma y Egipto usan `HistoricalWorld` en `history.ts`, la misma validación de fotografías, ayuda, transición, recogida y regreso. Solo cambian las fábricas de sus escenas.

## Salas, estados y progresión

Las medidas físicas compartidas viven en [museumLayout.ts](../src/museumLayout.ts). `roomSlots` define dos posiciones de 10,8 × 16 a la izquierda, una galería transversal de 24,9 × 10 al fondo y otras dos de 10,8 × 16 de regreso por la derecha. Roma conserva su tamaño, exhibición y luz cálida. Hall, envolvente, colisiones, ubicación del jugador y mapa utilizan esas referencias.

- `areaOrder` asigna las épocas a esas posiciones: Egipto → Roma → Medieval → Japón Feudal → Luna. También determina números y letreros.
- Todas las puertas se abren con E; las luces se encienden con un breve parpadeo. Las épocas pendientes son visitables y no bloquean el acceso a Roma.
- **Disponibilidad** (`wip` o `playable`) indica si existe el viaje; **progreso** indica si fue completado. Caminar por una WIP no la activa ni la completa.
- Solo una época jugable incompleta está activa a la vez: la primera disponible de `areaOrder`. Actualmente es Egipto y luego Roma. Al completar ambos viajes se muestra el cierre 2/5 en el panfleto y se permite seguir recorriendo el museo.
- Una foto válida inicia el viaje, pero el área solo se marca como completada al interactuar con el artefacto en el mundo histórico y regresar. La foto y la representación del artefacto se añaden juntas al panfleto en ese momento.
- `progress.ts` guarda el panfleto recibido y las fotos de las épocas completadas. Recargar durante un viaje conserva el último regreso confirmado; no se guarda una transición incompleta.

## Fotografía y escenas

- El encuadre visible y la cámara usada para capturar deben compartir posición, orientación y proyección. En el instante del disparo se renderiza la escena real a una imagen; la transición comienza después de conservar esa imagen.
- La validación proyecta el artefacto al encuadre y comprueba visibilidad con rayos frente a la geometría sólida. No exige que esté centrado. La misma función sirve para casco, escarabajo y futuras áreas.
- Una foto inválida produce su Polaroid, termina el revelado y devuelve el control sin avanzar. Una válida muestra el revelado y después carga el mundo de la época activa.
- Museo y mundo histórico comparten los sistemas de jugador, interacción y presentación. Al entrar en un mundo se inicia el contador de 20 segundos; si aún no se recogió el artefacto, se muestra una guía tenue a lo largo de una ruta transitable. Al salir se detiene y se retira esa guía.
- Mantener escenas y recursos separados para cargar el mundo activo y liberar el anterior. Esto evita que las cinco salas obliguen a mantener varios escenarios históricos en memoria.

## Estado de partida y controles

La experiencia necesita estados explícitos para inicio, exploración del museo, revelado, transición, exploración histórica, regreso y cierre del MVP. Cámara equipada, panfleto abierto y pausa se gestionan como modos compatibles con esos estados. El panfleto es papel 3D con dos hojas articuladas, manos y mirada inclinada; M lo abre y libera Pointer Lock sin pausar. M o un clic solicitan nuevamente el bloqueo y lo guardan. Escape abre la pausa. La cámara tiene animación de equipar, retroceso, expulsión de papel y revelado en la mano; el revelado se detiene durante la pausa. Los objetos sostenidos se dibujan en una segunda pasada de profundidad para evitar que vidrios o paredes los atraviesen, y se excluyen de la captura. El resultado usa la misma región del render que la validación. Durante revelado y transición se bloquean movimiento, nuevos disparos y panfleto.


Shift acelera el movimiento en exploración del museo, Roma y Egipto. La carrera se detiene al soltar la tecla y no queda retenida al abrir el panfleto, pausar o iniciar una transición.

El guardado usa la clave `museo-del-tiempo:v1`, versión 1 y IDs estables. Cada foto se reduce a JPEG 480 × 360 antes de guardarse, sin modificar la impresión que se revela. El orden **no** se guarda: al recargar se toma el `areaOrder` actual. Los datos malformados o de otra versión se descartan; un fallo de almacenamiento permite seguir jugando y muestra un aviso. Se retoma desde el hall con las entradas de las salas completadas abiertas. Reiniciar requiere confirmar y borra únicamente la partida de este juego.

Se retiró el viento ambiental sintetizado a pedido del usuario. Se conserva el efecto puntual de disparo con opción de silencio en el menú, sin bucles de audio durante la exploración. `disposeHistoricalScene` libera geometrías, materiales, mapas y sombras propios al regresar; conserva los recursos de los modelos Kenney y la rampa toon compartida.

## Render y decoración estática

El cielo es un fondo equirectangular con gradiente continuo; las nubes mantienen su geometría low-poly. No hay cúpula facetada. Se precargan los programas de materiales antes de habilitar el inicio y la lista de luces permanece estable al abrir salas: se cambia su intensidad sin recompilar por cada puerta.

La pasada de objetos sostenidos solo se ejecuta cuando se muestran; no vuelve a calcular sombras ni matrices del entorno. El sol de Egipto y los focos de exhibición conservan sus mapas de sombras estáticos. En el museo, el mapa solar se actualiza durante el movimiento del tren, del portón y del acceso. El guardia usa su sombra de contacto. El límite de densidad de píxeles es 1,5.

`staticMeshes.ts` agrupa geometrías opacas por material dentro de casas, fachada superior y jardinería. Conserva contornos y transformaciones; los colliders se calculan antes de agrupar. No se aplica a tren, portones, puertas, personajes ni artefactos fotografiables.

## Pruebas de arquitectura obligatorias

1. Intercambiar `egipto` y `luna` cambiando solo `areaOrder`: sala, letrero y panfleto se actualizan y todo el circuito sigue siendo recorrible.
2. Guardar Roma completada, cambiar el orden y recargar: la foto y el artefacto siguen asociados a `roma`.
3. Fotografiar un artefacto visible en un extremo del encuadre; repetir con el artefacto detrás de una pared: solo el primer disparo permite viajar.
4. Completar el artefacto histórico antes y después de los 20 segundos: la guía aparece únicamente en el segundo caso y nunca atraviesa paredes.
5. Abrir o cerrar panfleto y pausa alrededor de una transición: no quedan controles activos ni se pierde el estado de progreso.
