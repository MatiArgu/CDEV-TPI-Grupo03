# Revisión de la etapa 2 — movimiento

Esta revisión registra el patio de prueba tal como estaba en la etapa 2. El recorrido principal actual usa el museo de las etapas 3 y 5; el modo de inspección visual de la etapa 1 sigue disponible con `?view=far`, `?view=mid` y `?view=near`.

## Recorrido

- WASD mueve al jugador a altura humana; la velocidad diagonal se normaliza y no hay salto ni carrera. El movimiento de cabeza es leve y cesa al detenerse.
- El mouse gira la vista mientras Pointer Lock está activo. Escape lo libera y abre la pausa. El botón **Volver al recorrido** lo recupera mediante un nuevo clic del jugador.
- Las zonas sólidas del patio de prueba incluyen la fachada cerrada, el pedestal, las jardineras, los troncos y los bolardos. El jugador se desliza a lo largo de un obstáculo cuando el otro eje queda libre.
- Cerca del casco, mirarlo muestra **E — Inspeccionar casco**. La ficha libera el puntero y detiene el movimiento; Escape la cierra y deja el juego en pausa.

El retorno mediante clic es deliberado: después de liberar Pointer Lock con Escape, el navegador requiere un nuevo gesto de interacción para volver a capturarlo. Esta restricción forma parte de la [API de Pointer Lock](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API).

## Capturas de inspección

| Momento | Captura | Punto revisado |
| --- | --- | --- |
| Recorrido | [Ver imagen](capturas/etapa-2-recorrido.png) | Altura de cámara, escala del patio y ayuda de controles. |
| Frente al casco | [Ver imagen](capturas/etapa-2-interaccion.png) | Indicación contextual de E. |
| Ficha abierta | [Ver imagen](capturas/etapa-2-inspeccion.png) | Lectura de la interfaz sobre la escena detenida. |

## Verificación

- `npm run typecheck`, `npm run build` y `git diff --check`.
- Recorrido automatizado en Chrome: entrar, caminar hacia el casco, detenerse ante el pedestal, abrir la ficha con E, cerrarla con Escape, reanudar con clic y pausar otra vez con Escape. Se comprobó que una tecla sostenida al pausar o inspeccionar no produce movimiento al reanudar.
- Colisiones comprobadas contra el pedestal y la fachada; el mouse gira la vista solo con el puntero capturado.
- Revisión visual del modo normal y del modo de estudio en Chrome de escritorio.

Pendiente de revisión en el equipo de desarrollo: fluidez con aceleración gráfica real y recorrido manual de todas las zonas sólidas. Esta entrega no añade el museo ni la fotografía.

**Cambio posterior:** al comenzar la etapa 6 se añadió carrera con Shift. La velocidad normal sigue siendo 3,2 unidades/s y con Shift pasa a 5,4 unidades/s; la tecla se limpia al pausar o abrir una interfaz.
