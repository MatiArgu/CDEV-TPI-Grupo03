# Arquitectura actual

Three.js, TypeScript y Vite ejecutan el juego en el navegador sin backend. [main.ts](../src/main.ts) coordina carga de modelos, museo, controlador, cámara, render, viajes y regreso. El [codemap](CODEMAP.md) ubica los módulos concretos.

## Áreas y recorrido

El catálogo de [catalog.ts](../src/game/catalog.ts) asigna IDs estables y artefactos. `areaOrder` define el orden físico y de progreso: `egipto` → `roma` → `medieval` → `japon` → `luna`. [museumLayout.ts](../src/museum/museumLayout.ts) define cinco posiciones en U: dos salas a la izquierda, una transversal al fondo y dos a la derecha. Los números, letreros y el panfleto derivan de ese orden.

| ID | Objeto de la exhibición | Viaje |
| --- | --- | --- |
| `egipto` | Escarabajo egipcio | Templo ceremonial |
| `roma` | Casco de gladiador | Naumaquia |
| `medieval` | Llave antigua | Castillo |
| `japon` | Máscara Oni roja | Jardín y templo |
| `luna` | Nave lunar en miniatura | Superficie lunar y nave de regreso |

Las cinco áreas están disponibles. La puerta de una sala no exige completar la anterior; solo el viaje activo según `areaOrder` puede progresar. La disponibilidad `wip`/`playable` es distinta del progreso de la partida. Una visita se completa después de la interacción final en el mundo y el regreso confirmado al museo; la Luna exige subir a la nave y despegar desde la cabina.

## Mecánicas y estado

- [photo.ts](../src/game/photo.ts) captura la escena renderizada, revela toda foto y valida el artefacto por encuadre y oclusión. El objeto puede estar en un borde; una foto inválida permite reintentar. Los objetos sostenidos no aparecen en la captura.
- [player.ts](../src/game/player.ts), [pamphlet.ts](../src/game/pamphlet.ts), [held.ts](../src/game/held.ts) y [timeTransition.ts](../src/game/timeTransition.ts) coordinan movimiento, Pointer Lock, cámara, panfleto físico, pausa y fundidos. Movimiento y nuevas acciones se bloquean durante revelado o transición; Escape puede pausar esos procesos.
- Cada época implementa el contrato [HistoricalWorld](../src/worlds/history.ts). Comparte controles, fotografía, transición y [ayuda](../src/game/help.ts), que aparece tras 20 segundos sin recuperar el objeto. El abordaje lunar añade los estados de escalerilla, cabina y ascenso.
- [progress.ts](../src/game/progress.ts) guarda en `localStorage` con la clave `museo-del-tiempo:v1`: panfleto recibido y fotos JPEG 480 × 360, asociados a IDs estables. Al recargar se retoma desde el hall. Un viaje interrumpido no se confirma; el reinicio borra solo esa clave.

## Render y recursos

Los modelos Kenney se cargan antes de crear escenas; el [manifiesto](../public/assets/kenney/manifest.json) y las licencias acompañan los archivos. Los materiales toon y la paleta compartida permanecen cargados. Al salir de un mundo, [history.ts](../src/worlds/history.ts) libera recursos propios sin desechar modelos ni materiales compartidos. El cielo exterior usa un gradiente continuo y nubes low-poly; la Luna tiene su propio cielo y visor. Agrupación de piezas estáticas, sombras controladas y densidad máxima de píxeles de 1,5 reducen el costo de render.

Los casos que protegen estos contratos están en [VERIFICACION.md](VERIFICACION.md).
