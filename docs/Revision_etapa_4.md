# Revisión de la etapa 4 — Polaroid

La mecánica de fotografía se prueba en `?photo-test`, un laboratorio temporal separado del recorrido principal. El cristal de ensayo y el eco temporal son recursos de prueba, no áreas del catálogo ni contenido histórico definitivo.

## Recorrido de prueba

1. **Entrar al laboratorio** captura el mouse. WASD mueve al jugador y C equipa o guarda la cámara 3D.
2. Al equiparla aparece el visor. **Clic** dispara con un sonido breve y captura el render real dentro de ese marco. La imagen se muestra en una Polaroid que pasa de borrosa a nítida.
3. Una foto con parte visible del cristal, incluso en el borde del visor, abre el eco temporal después del revelado. Una foto sin el cristal visible termina el revelado y devuelve el control de la cámara para reintentar.
4. El panel oscuro permite tapar el cristal por completo desde un ángulo a la derecha. El portal del eco se activa con E para volver al laboratorio. Escape pausa y libera el mouse; el botón del menú recupera Pointer Lock.

El visor y la captura usan la misma cámara y proyección. La validación limita los rayos al área fotografiada y comprueba que la primera malla sólida alcanzada sea parte del cristal. Los contornos ilustrados no cuentan como superficies oclusoras. Durante revelado y transición quedan bloqueados el movimiento, las interacciones y nuevos disparos. Al cambiar de escena se liberan sus geometrías, materiales y sombra.

## Capturas de inspección

| Momento | Captura | Punto revisado |
| --- | --- | --- |
| Visor | [Ver imagen](capturas/etapa-4-visor-borde.png) | Cristal parcialmente dentro del borde derecho; cámara 3D fuera del área capturada. |
| Revelado | [Ver imagen](capturas/etapa-4-revelado.png) | La fotografía conserva el recorte visible y llega a una imagen nítida. |
| Oclusión | [Ver imagen](capturas/etapa-4-occlusion.png) | El panel tapa el cristal desde la posición de prueba lateral. |
| Eco | [Ver imagen](capturas/etapa-4-eco.png) | Destino temporal pequeño y portal de regreso. |

## Aceptación y verificación

- En Chrome se verificó una foto centrada y otra con solo parte del cristal en el borde: ambas se revelan, se marcan válidas y llevan al eco. La imagen PNG de 800 × 600 coincide visualmente con el contenido del visor, sin su marco ni el modelo de la cámara.
- Una foto con el cristal fuera del visor y otra con el cristal totalmente detrás del panel se revelan como inválidas, permanecen en el laboratorio y permiten un nuevo disparo. En una misma sesión se confirmó inválida → reintento válido → eco.
- Se probó el regreso por el portal y la recuperación del control del mouse. `npm run typecheck`, `npm run build` y `git diff --check` completados.

Queda para la revisión del equipo el ritmo subjetivo del revelado y la fluidez con aceleración gráfica real. La integración con la exhibición romana, el progreso y el panfleto corresponde a etapas posteriores.
