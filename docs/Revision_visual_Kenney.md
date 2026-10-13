# Renovación visual con Kenney

Esta revisión mejora los escenarios y las herramientas existentes de las etapas 1 a 6. Se mantiene el recorrido jugable del [plan](Plan_de_desarrollo.md): inicio, guardia, panfleto, primera puerta, exhibición, fotografía, naumaquia y regreso con Roma completada. Egipto y las otras ocho épocas permanecen WIP.

## Actualización: patio con estación

El jugador comienza en `(1, 26.3)`, a altura humana, del lado seguro del andén y mirando al museo. La locomotora y sus tres vagones quedan detrás. La primera mirada hacia las vías desde el patio inicia una partida con aceleración suave; continúa al mirar al frente y no se repite. Se detiene durante la pausa y al consultar el panfleto. El tren se oculta únicamente después de salir del alcance de la niebla desde toda la plaza.

Ocho casas adosadas, de uno o dos pisos, cierran los laterales. Muros cortos las conectan con la fachada; una baranda continua separa el andén de los rieles. Todos esos límites tienen colisiones, incluidas sus uniones. Las puertas de las casas son decorativas y permanecen cerradas. El único acceso que continúa el recorrido es la entrada del museo.

La fachada ahora tiene cubiertas rectangulares a cuatro aguas, buhardillas, cornisas y un pabellón central con reloj y frontón. Los marcos Kenney, las contraventanas, la piedra clara y los tonos salvia unifican museo y casas. Se añaden tres modelos de Train Kit con su textura y licencia CC0. `src/courtyard.ts` construye el perímetro y la llegada; el museo expone su posición inicial y recibe la cámara solamente durante el juego activo para actualizar el tren.

| Vista actual | Captura |
| --- | --- |
| Llegada al museo | [Desde el andén](capturas/patio-llegada.png) |
| Plaza cerrada | [Vista de conjunto](capturas/patio-plaza.png) |
| Fachada y techo | [Pabellón central](capturas/patio-fachada.png) |
| Casas bajas | [Lateral de la plaza](capturas/patio-casas.png) |
| Tren y vías | [Andén](capturas/patio-anden.png) |

Verificado en Chrome con el controlador del juego: inicio sin partida automática; activación al girar; continuidad al volver a mirar al frente; pausa con Escape y panfleto; partida única sin reaparecer. Pasaron 14 pruebas de colisión corriendo contra paredes, juntas entre casas, esquinas delanteras y traseras, baranda y fachada. También se recorrió desde el nuevo inicio hasta el guardia, hall, foto inválida, foto válida, Roma, recogida del casco y regreso con 1/10. Se comprobó recuperar Pointer Lock después de una transición en pausa.

`npm run typecheck`, `npm run build` y `git diff --check` correctos. En la compilación final se cargaron 31 GLB y cuatro texturas externas sin errores; también se abrió el estudio visual. El manifiesto coincide con los tamaños y hashes de los archivos, y están presentes las seis licencias. Vite conserva el aviso por tamaño del bundle principal, ahora de aproximadamente 703 kB antes de gzip.

La vista de llegada registra unas 28.600 caras triangulares y 1.136 llamadas de dibujo; la vista elevada de la plaza, unas 30.200 y 1.213. Las varillas de la baranda usan una sola malla instanciada. Son cifras de complejidad de la escena; la fluidez con GPU física sigue pendiente de medición. Las capturas y cifras de la revisión inicial que siguen corresponden al patio anterior.

## Cambios

- **Patio y fachada:** árboles con raíces y ramas, jardineras con flores, bancos, faroles, plantas junto a la entrada, ventanas arqueadas, segundo nivel y cubiertas. La pirámide incorpora una trama de juntas. El cielo y la luz exterior pasan a tonos más suaves.
- **Acceso y hall:** se conserva el guardia de la revisión anterior y su entrega animada. Se suman esculturas, bancos tapizados, plantas, marcos, pequeñas piezas dentro de vitrinas, luminarias y cartelería con una tipografía de museo.
- **Exhibición romana:** columnas acanaladas, una columna rota, esculturas, ánfora propia, escudos, estandartes, fichas y un mural ilustrado de la naumaquia. El suelo iluminado combina piedra clara con una alfombra terracota. La puerta siguiente sigue visible y cerrada.
- **Casco:** un único modelo propio para el estudio, la exhibición y el mundo histórico, con carrilleras curvas, remaches, orificios y cresta. Se conserva como artefacto fotografiable.
- **Naumaquia:** dos niveles de arcos, gradas elípticas, estandartes, botes adaptados con remos y velas rectangulares, soldados en poses fijas, lanzas, cajas y barriles. El agua incorpora trazos de superficie y conserva las salpicaduras suspendidas. La pasarela central y la ayuda siguen la misma ruta.
- **Presentación:** portada con aspecto de papel, Polaroid con bordes redondeados, visor, correa y detalles gráficos. El modelo de cámara queda fuera de la abertura del visor.
- **Estudio visual:** utiliza los mismos árboles, plantas y casco de la renovación.

## Capturas revisadas

| Vista | Captura |
| --- | --- |
| Inicio jugable | [Portada](capturas/kenney-inicio.png) |
| Patio y fachada | [Vista general](capturas/kenney-patio.png) |
| Entrada | [Acceso](capturas/kenney-acceso.png) |
| Hall | [Interior](capturas/kenney-hall.png) |
| Exhibición | [Roma en el museo](capturas/kenney-exhibicion.png) |
| Fotografía | [Visor](capturas/kenney-visor.png) y [revelado](capturas/kenney-revelado.png) |
| Mundo romano | [Naumaquia](capturas/kenney-roma.png) y [embarcación](capturas/kenney-barco.png) |
| Ayuda | [Ruta iluminada](capturas/kenney-ayuda.png) |
| Regreso | [Panfleto con 1/10](capturas/kenney-completado.png) |
| Estudio | [Vista de conjunto](capturas/kenney-estudio.png) |

Las vistas generales se renderizaron con las mismas fábricas de escena del juego y cámaras de inspección. Inicio, visor, revelado, ayuda y panfleto corresponden al recorrido con la interfaz real.

## Recursos y carga

Se integraron **28 modelos de cinco paquetes**, con sus licencias CC0 y sus texturas externas. El [informe de selección](Seleccion_Kenney.md) contiene el alcance de la exploración, el inventario completo y las recomendaciones. El [manifiesto](../public/assets/kenney/manifest.json) identifica cada archivo y su procedencia.

`src/assets.ts` carga la selección antes de habilitar la visita. Convierte materiales a toon, ajusta colores de vegetación y madera y normaliza tamaños y apoyo en el suelo. Los sólidos nuevos tienen colisiones; los objetos de la exhibición también participan en la oclusión fotográfica. Los bounds de colisión se calculan después de aplicar la posición de la sala.

Las instancias comparten geometría y texturas del caché de modelos durante la sesión; las figuras tienen esqueletos independientes. Al salir de Roma se liberan geometrías y materiales propios del mundo y las texturas de huesos, conservando los recursos compartidos que todavía usa el museo. Los 80 arcos de la arena se dibujan con dos `InstancedMesh`.

La selección vive en `public/assets/kenney/` y se incluye en `dist/`; el juego no depende de la carpeta de Windows. No se añadieron dependencias al proyecto: los cargadores, clonación de esqueletos y geometrías redondeadas pertenecen a Three.js.

## Verificación

- `npm run typecheck` y `npm run build`: correctos. Vite informa un aviso por el bundle principal de aproximadamente 697 kB antes de gzip; no impide la compilación.
- Carga en Chrome: los 28 GLB y las texturas de paleta se cargan; se revisaron patio, acceso, hall, exhibición, estudio y naumaquia.
- Recorrido de escritorio: Pointer Lock, WASD, Shift, interacción con guardia, entrega del panfleto, paso central, entrada a Roma y apertura de la puerta 01.
- Fotografía: casco centrado y en el borde aceptados; parcialmente tapado aceptado; fuera de cuadro y totalmente oculto rechazados. Los ensayos usan el casco y los sólidos de la exhibición renovada.
- Foto inválida: se revela y permite reintentar sin viajar. Foto válida: captura el escenario, se revela y conduce a Roma. Se revisó la imagen resultante contra el visor.
- Durante el revelado, caminar y pulsar M no altera el estado ni la posición. Se liberó Pointer Lock durante el viaje: la transición terminó en pausa y se recuperó el control con el botón del menú.
- Ayuda: permanece apagada a los 19,99 segundos y se activa al superar los 20. La ruta central no intersecta los obstáculos registrados. La escena puede liberarse y crearse nuevamente conservando el caché compartido.
- Regreso: caminar por la pasarela, recoger con E, volver a la exhibición y registrar foto y casco como 1/10. Se completó antes de los 20 segundos sin activar la ayuda y también después, con la ayuda visible. Egipto continúa cerrado.
- Reordenamiento temporal en memoria: mover Egipto al puesto 8 cambia su sala al ala derecha, número y panfleto a 08; conserva su ID y disponibilidad WIP. El orden del código queda intacto.
- Integridad: cotejo de GLB con los hashes del manifiesto, presencia de sus texturas y licencias, enlaces locales y `git diff --check`.

La automatización usa Chrome con SwiftShader. Para comprobar el recorrido completo en ese entorno se avanzó el tiempo de simulación con el controlador real y se enviaron eventos de teclado y mouse; las transiciones conservaron sus tiempos reales. Las herramientas temporales de inspección no forman parte del juego.

## Límites de esta revisión

La navegación y la lógica del recorrido se verificaron en navegador, pero queda por medir la fluidez en un escritorio con aceleración gráfica real. Como referencia de complejidad, la vista amplia del patio registró aproximadamente 23.400 triángulos y 830 llamadas de dibujo, y la vista frontal de Roma unos 21.900 triángulos y 169 llamadas; estas cifras no son una medición de FPS.

Persistencia, reinicio y ciclo egipcio corresponden a la etapa 7. La prueba de guardado por ID no aplica todavía. El acceso a una época jugable colocada detrás de puertas WIP sigue siendo una decisión pendiente del recorrido.
