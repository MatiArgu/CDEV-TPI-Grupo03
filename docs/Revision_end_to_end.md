# Barrido de extremo a extremo

Revisión del 13 de octubre de 2026. Alcance: patio, guardia, museo, cinco viajes, regreso al hall, guardado y reinicio.

## Correcciones

| Hallazgo | Cambio |
| --- | --- |
| El patio calculaba los focos de todas las salas, incluso fuera del museo | Se excluyen luces interiores desde el exterior y se recuperan antes de cruzar el acceso. Se conserva el gradiente de luz al entrar. |
| Muchas piezas estáticas pequeñas se dibujaban por separado | Agrupación del hall y de paneles/molduras por sala. Se conservan geometría, colisiones, lámparas y artefactos. |
| Puertas y entrega del guardia seguían avanzando durante la pausa | La actualización del museo respeta inicio/pausa y limita el paso de tiempo al recuperar una pestaña suspendida. |
| El viaje cambiaba de escena con temporizadores aunque estuviera pausado | Fundido con tiempo acumulado solo durante juego activo. Escape funciona también durante revelado y viaje; el menú queda por encima del fundido. |
| Un mundo histórico podía liberar materiales de la paleta usados por el museo | Se distingue la propiedad de los materiales globales y se mantienen al regresar. |
| La fotografía podía contar artefactos ocultos y obstáculos invisibles | La validación respeta la visibilidad del objeto y sus ancestros; omite piezas ocultas. |
| Rayas de autosombra en faraones y muros egipcios | Las estatuas y los grandes muros conservan sombras sobre el suelo y sombreado toon sin recibir su propia sombra. |
| Cartelería con vocabulario de implementación | «Colección del museo» y «Por descubrir»; la pieza lunar expuesta se identifica como roca. |

También se preparan los programas del mundo histórico durante el fundido para reducir tirones al empezar a mirar alrededor.

## Recorrido y comprobaciones

La automatización parte de una partida vacía en un perfil de prueba. Usa teclado/mouse y avanza el controlador en pasos de 50 ms. Camina por el patio, recibe el panfleto, abre puertas, rodea pedestales y recorre Egipto → Roma → Medieval → Japón → Luna → hall. No teletransporta al jugador entre puntos del recorrido ni inyecta fotos de épocas completadas. Las cinco fotos se capturan desde el render.

Se verifican:

- Foto inválida y reintento; revelado y transición; bloqueo de movimiento/panfleto; pausa de puerta y viaje.
- Recogida en los cuatro primeros mundos; escalera, altura de cabina, guantes, visor, pausa del abordaje y ascenso lunar.
- Ayuda tras 20 segundos en los cinco mundos; cursor al abrir el panfleto; cinco recuerdos y vuelta al hall.
- Recarga en un documento nuevo, conservación por ID, silencio y reinicio.
- Foto centrada, en un borde y parcialmente tapada; rechazo fuera del encuadre y con oclusión completa. Artefacto invisible rechazado y obstáculo invisible ignorado en las cinco exhibiciones.
- Límites del museo y de los cinco mundos mediante exploración del suelo alcanzable en una cuadrícula de 0,25 m con radio de jugador de 0,28 m. No se detectaron salidas por el perímetro.
- 17 puntos de techo vistos desde abajo: hall, cinco salas, templo egipcio y templo japonés.
- Liberación/recreación de los cinco mundos sin liberar geometrías compartidas ni materiales de la paleta global. Conservación de cinco recuerdos al intercambiar Egipto y Luna en `areaOrder`.

La cuadrícula y los puntos de techo son comprobaciones discretas; se complementan con la caminata continua y la revisión de capturas, sin afirmar una inspección de cada centímetro del escenario.

## Rendimiento

Mismas vistas, resolución 1280 × 800, Chrome con SwiftShader, luces de las salas encendidas y sombras ya preparadas. Se cuenta la pasada completa del render:

| Vista | Llamadas antes | Después | Reducción |
| --- | ---: | ---: | ---: |
| Patio | 1524 | 1172 | 23,1 % |
| Hall hacia el fondo | 1145 | 874 | 23,7 % |
| Lateral del hall | 190 | 142 | 25,3 % |
| Sala romana | 354 | 296 | 16,4 % |

La agrupación reduce llamadas, pero algunos grupos abarcan más espacio: en el hall se envían 55.870 triángulos frente a 54.298 antes. Los tiempos de SwiftShader varían y no equivalen a FPS de una GPU real. Queda pendiente medir fluidez y latencia del mouse en el equipo de destino; no se promete una tasa de cuadros específica.

## Repetir las pruebas

Requiere Node 22 o posterior con WebSocket global, dependencias instaladas y Chrome/Chromium con depuración remota. Usar un perfil exclusivo: la prueba de recorrido borra **la partida de ese perfil** y también comprueba Reiniciar visita.

```sh
npm run dev -- --host 127.0.0.1 --port 5174
# En otra terminal; ajustar el ejecutable a la instalación local.
google-chrome-stable --headless=new --remote-debugging-port=9240 \
  --user-data-dir=/tmp/museo-qa-browser about:blank
# En otra terminal, una prueba por vez:
npm run qa:e2e
npm run qa:scenes
node scripts/qa/performance.mjs review
```

En contenedores sin GPU se usó SwiftShader; las opciones del navegador dependen del entorno. `GAME_URL` permite indicar el puerto real de Vite y `CDP_URL` la dirección de depuración. `QA_OUTPUT` cambia el directorio de capturas del recorrido (por defecto `/tmp/museo-e2e`). La comparación de rendimiento escribe en `/tmp/perf-review.json` y `/tmp/review-*.png`.

Los hooks de inspección se inyectan por DevTools en la respuesta de desarrollo; no se agregan al juego ni al compilado de producción. La página de comprobación de escenas está en `scripts/qa/` y no es una entrada del build.


## Resultado y capturas

- `npm run typecheck`, `npm run build` y `git diff --check`: correctos. Vite mantiene el aviso del bundle principal mayor a 500 kB.
- Producción: 57 modelos y siete texturas cargados sin errores; inicio jugable y modo de estudio comprobados.
- Prueba continua: **PASS**, cinco viajes y cinco fotografías reales, regreso al hall, recarga de las cinco fotos y reinicio a una partida vacía, sin errores de ejecución.
- Comprobación de escenas: **PASS** en fotografía, seis perímetros, 17 puntos de techo, liberación/recreación y reordenamiento por ID.

| Vista | Evidencia |
| --- | --- |
| Exterior e interior | [Patio](capturas/e2e-patio.png), [hall](capturas/e2e-hall.png), [Roma](capturas/e2e-roma.png) |
| Sombras egipcias | [Patio ceremonial sin rayas de autosombra](capturas/e2e-egipto.png) |
| Recorrido japonés | [Puente y torii](capturas/e2e-japon-llegada.png) |
| Regreso lunar | [Cabina](capturas/e2e-luna-cabina.png) |
| Cinco viajes realizados | [Panfleto con las cinco fotos](capturas/e2e-cinco-recuerdos.png) |
| Persistencia | [Cinco recuerdos después de recargar](capturas/e2e-recarga-cinco.png) |
