# Renovación visual con Kenney

Esta revisión mejora los escenarios y las herramientas existentes de las etapas 1 a 6. Se mantiene el recorrido jugable del [plan](Plan_de_desarrollo.md): inicio, guardia, panfleto, primera puerta, exhibición, fotografía, naumaquia y regreso con Roma completada. Egipto y las otras ocho épocas permanecen WIP.

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
