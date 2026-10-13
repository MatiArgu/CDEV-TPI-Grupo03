# Revisión de la etapa 6 — Roma de principio a fin

> Registro histórico de esta revisión. Algunas capturas originales no están incluidas en el repositorio y se identifican como tales. Para la organización actual del código, ver el [codemap](../CODEMAP.md).

Roma es la única época jugable de esta entrega. La puerta 01 conduce a una exhibición con casco de gladiador sobre un pedestal. La Polaroid se equipa con C dentro de la sala, captura el render real al hacer clic y solo inicia el viaje si el casco aparece visible dentro del visor. Una foto inválida se revela y permite reintentar.

El destino es una naumaquia estilizada y detenida en el tiempo: graderío del Coliseo, barcos, figuras y salpicaduras inmóviles rodean una pasarela transitable. El casco al final se recoge con E. El regreso registra la foto y una ilustración del casco en el panfleto, marca Roma como completada y muestra 1/10. Egipto aún está WIP; su puerta permanece cerrada después de completar Roma.

Por pedido posterior a la etapa 2, mantener Shift permite correr a 5,4 unidades/s frente a 3,2 unidades/s al caminar. La velocidad diagonal sigue normalizada y el estado de las teclas se limpia al pausar o abrir interfaces.

## Capturas

| Momento | Captura |
| --- | --- |
| Exhibición romana | Ver imagen — captura no incluida (`capturas/etapa-6-exhibicion.png`) |
| Casco dentro del visor | Ver imagen — captura no incluida (`capturas/etapa-6-visor.png`) |
| Naumaquia desde la entrada | Ver imagen — captura no incluida (`capturas/etapa-6-naumaquia.png`) |
| Ayuda tenue tras 20 segundos | Ver imagen — captura no incluida (`capturas/etapa-6-ayuda.png`) |
| Panfleto con foto, casco y 1/10 | Ver imagen — captura no incluida (`capturas/etapa-6-panfleto.png`) |

## Verificación y límites

- En Chrome se recorrió guardia → puerta 01 → foto inválida → reintento válido → naumaquia → casco → regreso. También se repitió el ciclo caminando con WASD y Shift por las colisiones reales desde el exterior hasta el casco, sin teletransportes. La foto inválida dejó la cámara disponible, la válida produjo un PNG real de 800 × 600 y el regreso abrió el panfleto con Roma completada. Se comprobó que la puerta 02 siguió cerrada.
- La validación aceptó el casco centrado y parcialmente en el borde del visor, rechazó el casco fuera del cuadro y lo rechazó detrás de la pared interior. La misma función de encuadre y oclusión de la etapa 4 se usa ahora en el museo.
- La ayuda estaba oculta al llegar; al alcanzar 20 segundos se activaron seis marcas sobre la pasarela, sin cruzar muros. El temporizador se detiene mientras el panfleto o la pausa están abiertos y desaparece al abandonar la escena histórica.
- En Chrome, un paso de 0,05 s desplazó 0,16 unidades caminando y 0,27 corriendo. El panfleto completado cupo en ventanas de 777 × 551 y 777 × 450. `npm run typecheck`, `npm run build` y `git diff --check` pasaron.
- Se abrió y cerró el panfleto antes de entrar; M no lo abrió durante el revelado. Tras volver de Roma, se cerró el panfleto, se pausó con Escape y se recuperó Pointer Lock con el botón del menú sin perder el progreso.

La etapa 7 añadirá Egipto, persistencia local por ID, reinicio y conclusión del MVP. La fluidez con GPU real y el ritmo subjetivo del recorrido requieren revisión manual en el equipo de desarrollo.
