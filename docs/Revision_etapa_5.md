# Revisión de la etapa 5 — diez salas WIP

El hall ahora continúa en una galería con cinco pares de salas compactas. Las diez se pueden visitar y están vacías: sus letreros muestran número, nombre y estado «En preparación · WIP». El color de cada área aparece en el suelo y muro interior y se repite en el panfleto. Roma conserva la luz cálida que orienta al visitante después de abrir el mapa.

`areaOrder` asigna cada ID a una posición fija del corredor. El número, los dos letreros de cada sala y el mapa e índice del panfleto se generan desde esa misma lista. El catálogo conserva la identidad de cada área y su disponibilidad; en esta entrega todas son `wip`, incluida Roma y Egipto. No hay exhibiciones ni activación de viajes. Se retiró el laboratorio temporal de la etapa 4 de la ruta pública.

## Capturas de inspección

| Vista | Captura | Punto revisado |
| --- | --- | --- |
| Panfleto | [Ver imagen](capturas/etapa-5-panfleto.png) | Cinco pares de salas, números, colores y estado WIP. |
| Acceso a galería | [Ver imagen](capturas/etapa-5-galeria.png) | Corredor abierto desde el hall, entradas y señalización. |
| Sala 01 | [Ver imagen](capturas/etapa-5-roma.png) | Interior visitable y vacío, identidad de Roma. |
| Sala 10 | [Ver imagen](capturas/etapa-5-luna.png) | Última sala visitable e identidad de Luna. |
| Reordenamiento temporal | [Ver imagen](capturas/etapa-5-egipto-reordenado.png) | Egipto en la sala 08, con letrero y aviso correspondientes. |

## Aceptación y verificación

- Se recorrió en Chrome desde el exterior hasta el guardia, se recibió y abrió el panfleto, se entró al hall y se avanzó por el corredor hasta la última fila. Se ingresó físicamente en la primera sala izquierda y en la última derecha; ambas usaron las mismas puertas y colisiones que los demás módulos.
- Para probar el orden, se movió **solo** `egipto` del puesto 2 al 8. El mapa y el índice lo mostraron como 08, y se entró a su nueva sala derecha: el letrero interior y el aviso mostraron «08 · Egipto Antiguo». Se restauró el orden inicial Roma → Egipto al terminar.
- Las diez salas se generan con un único módulo parametrizado por `areaOrder`; cada entrada deja un paso libre y los muros tienen colisión. Los únicos accesos interactivos actuales son el guardia y las interfaces del museo, por lo que una WIP no inicia un viaje.
- Con el orden inicial restaurado, una última comprobación en Chrome confirmó diez entradas WIP en el mapa y el índice, con Roma 01 y Egipto 02. La antigua URL `?photo-test` abre el recorrido principal y no el laboratorio retirado.
- `npm run typecheck`, `npm run build` y `git diff --check` se ejecutaron al cierre de la entrega. Las capturas se revisaron visualmente con Chrome en renderizado por software.

La integración de exhibiciones, fotografía y progreso queda para Roma en la etapa 6. La fluidez con aceleración gráfica real todavía requiere revisión del equipo en el equipo de desarrollo.

## Refinamiento posterior de la etapa 5

Se mantuvo la disposición de diez salas y se reforzó su lectura desde la altura del jugador: cada puerta tiene ahora un número lateral a la vista, un marco con acentos del área y trazos de tinta selectivos. El corredor usa manchas de color planas sobre el suelo; los muros y el piso de la galería dejan de recibir las sombras duras del sol, que se veían distintas entre filas. El guardia recibió rasgos faciales sencillos. Estas decisiones siguen la [paleta toon con bandas discretas](https://threejs.org/docs/pages/MeshToonMaterial.html) y el uso de [sombras pintadas para escenas estáticas](https://threejs.org/manual/pages/shadows.html) descritos por Three.js.

| Vista refinada | Captura | Punto revisado |
| --- | --- | --- |
| Galería | [Ver imagen](capturas/etapa-5-galeria-refinada.png) | Números laterales, manchas del suelo y luz uniforme. |
| Guardia | [Ver imagen](capturas/etapa-5-guardia-refinado.png) | Rostro legible a distancia de conversación. |

La palabra WIP del mapa, índice, avisos y letreros procede ahora de la disponibilidad del catálogo. Una prueba temporal con Roma marcada `playable` mostró «LISTA» en mapa e índice y cambió la nota de disponibilidad; se restauró `wip` al terminar. El panfleto conserva Pointer Lock porque se maneja solo con M y bloquea el movimiento; Escape lo libera al pausar, conforme al comportamiento de la [API de Pointer Lock](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API). La captura fotográfica definitiva seguirá requiriendo validación al integrar Roma.

Tras restaurar el estado WIP, `npm run typecheck`, `npm run build`, la comprobación de enlaces y `git diff --check` pasaron. En Chrome se confirmó que el inicio muestra las diez áreas WIP en orden, que los diez nombres caben completos en un máximo de dos líneas por letrero, que M no abre el panfleto antes de recibirlo y que Escape pausa y libera el puntero. La inspección visual usó renderizado por software; falta medir fluidez con GPU real.
