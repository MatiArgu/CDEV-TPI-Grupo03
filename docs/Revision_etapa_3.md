# Revisión de la etapa 3 — museo e introducción

El recorrido principal empieza en el patio de un museo ficticio inspirado en el Louvre. La pirámide de cristal, la fachada y el guardia se construyeron con la paleta y los materiales ilustrados de la etapa 1. La puerta central se abre tras recibir el panfleto; el patio y el hall forman una escena 3D continua.

## Recorrido y controles

1. **Comenzar visita** captura el mouse para caminar con WASD y mirar en primera persona.
2. Junto a la entrada aparece **E — Recibir panfleto del guardia**. La entrega anima su brazo y abre las hojas de la puerta.
3. **M** despliega el panfleto frente a la cámara. Su plano e índice muestran las diez áreas en el orden de `areaOrder`. Mientras está abierto, el movimiento y la mirada se detienen; M lo guarda y continúa el recorrido.
4. Al desplegarlo por primera vez se enciende una luz cálida y aparece la señal del futuro sector romano. El jugador puede atravesar la entrada y recorrer el hall hasta ese umbral cerrado.
5. **Escape** pausa y libera el puntero, incluso con el panfleto abierto. Un clic en **Volver al recorrido** recupera Pointer Lock.

El catálogo en `src/catalog.ts` aporta IDs estables, nombres y artefactos. Su lista `areaOrder` determina los números y posiciones del panfleto y el número de la señal romana. Ninguna de las diez áreas tiene aún sala histórica jugable: los módulos físicos llegan en la etapa 5. La [etapa 4](Revision_etapa_4.md) ensaya la fotografía y un viaje en un laboratorio temporal separado.

## Capturas de inspección

| Momento | Captura | Punto revisado |
| --- | --- | --- |
| Patio | [Ver imagen](capturas/etapa-3-patio.png) | Pirámide, fachada, vegetación y ruta hacia el guardia. |
| Guardia | [Ver imagen](capturas/etapa-3-guardia.png) | Proximidad y señal contextual de E. |
| Panfleto | [Ver imagen](capturas/etapa-3-panfleto.png) | Papel desplegado, mapa e índice de diez áreas. |
| Hall | [Ver imagen](capturas/etapa-3-hall.png) | Arquitectura, vitrinas y luz hacia Roma. |

## Aceptación y verificación

- El recorrido automatizado en Chrome confirmó que se puede iniciar, llegar al guardia, recibir el panfleto, abrirlo, cerrarlo y entrar al hall en la misma sesión.
- Antes de hablar con el guardia, M no abre el panfleto y la puerta impide entrar. Tras recibirlo, la puerta se despeja y deja pasar al jugador.
- El panfleto muestra diez nombres y números; mantener W mientras está abierto no mueve al jugador. Se comprobó también que Escape cierra la interfaz y pausa sin movimiento residual.
- La revisión visual confirmó la lectura separada de pirámide, fachada y guardia, y la iluminación más cálida del umbral romano respecto del sector futuro cerrado.
- `npm run typecheck`, `npm run build`, enlaces locales y `git diff --check` completados.

Pendiente de revisión en el equipo de desarrollo: fluidez con aceleración gráfica real y recorrido manual de todas las colisiones del patio y del hall.
