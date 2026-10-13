# Museo de viajes en el tiempo

Proyecto de videojuego 3D en primera persona para navegador. El recorrido comienza en el andén de una plaza: al mirar atrás, el portón termina de cerrarse y el tren parte; el museo ficticio inspirado en el Louvre queda enfrente. Casas de uno y dos pisos, jardines y una baranda delimitan el patio. Se puede recibir un panfleto, recorrer un hall de piedra oscura con obras, vitrinas y luz cálida y recorrer cinco salas en U: Antiguo Egipto → Antigua Roma → Época Medieval → Japón Feudal → Llegada a la Luna. Egipto y Roma ocupan el ala izquierda, Medieval conecta ambas alas al fondo y Japón y Luna regresan por la derecha. Todas son visitables; Egipto y Roma tienen viajes históricos completos, en ese orden. El patio tiene pavimento continuo, cielo con gradiente suave y nubes low-poly; el interior combina paneles de piedra, molduras y luz cálida.

## Ejecutar el prototipo

Requiere Node.js 20.19 o posterior y npm.

```sh
npm install
npm run dev
```

Abrir la dirección local que muestra Vite y hacer clic en **Comenzar visita**. **WASD** camina, **Shift** corre y el **mouse** controla la mirada. Recibir el panfleto del guardia con **E**; **M** lo levanta y libera el cursor, **M o clic** lo guardan. Abrir las puertas con **E**.

En la sala 01 (Egipto), **C** prepara la Polaroid y **clic** fotografía el escarabajo. Una foto válida lleva al templo ceremonial; recorrerlo y recoger el amuleto con **E** para volver. Luego completar Roma, sala 02, fotografiando el casco y recuperándolo en la naumaquia. El panfleto conserva ambos recuerdos y muestra **2/5**. Las otras tres épocas son visitables, sin viajes.

**Escape** pausa. Inicio y pausa incluyen sonido y **Reiniciar visita**, que pide confirmar antes de borrar las fotos. El panfleto recibido y las épocas completadas se guardan localmente por ID; al recargar se continúa desde el hall. Un viaje interrumpido antes de recoger el artefacto debe repetirse.

Para revisar el estilo de la etapa 1 sin caminar, abrir `?view=far`, `?view=mid` o `?view=near` al final de la dirección local. En ese modo se puede orbitar con el mouse, acercar con la rueda y cambiar entre las tres vistas. `npm run typecheck` revisa tipos y `npm run build` genera la versión estática en `dist/`.

La Polaroid expulsa y revela una fotografía real como objeto 3D, y el panfleto se despliega en las manos. Solo quedan avisos contextuales, encuadre y pausa en pantalla. La ayuda de los mundos aparece tras 20 segundos de exploración. El progreso se conserva en este navegador; no existe backend ni sincronización entre dispositivos.

[Revisión visual y capturas de la etapa 1](docs/Revision_etapa_1.md).
[Revisión del recorrido de la etapa 2](docs/Revision_etapa_2.md).
[Revisión del museo y la introducción de la etapa 3](docs/Revision_etapa_3.md).
[Revisión de la Polaroid de la etapa 4](docs/Revision_etapa_4.md).
[Revisión de las diez salas de la etapa 5](docs/Revision_etapa_5.md).
[Revisión del ciclo romano de la etapa 6](docs/Revision_etapa_6.md).
[Renovación visual con modelos Kenney y capturas](docs/Revision_visual_Kenney.md).
[Inventario completo, selección y recomendaciones de assets](docs/Seleccion_Kenney.md).

La renovación incorpora 31 modelos de seis paquetes Kenney, con sus texturas y licencias CC0 en `public/assets/kenney/`. El juego carga esa selección local antes de habilitar la visita; no necesita acceder a la carpeta original de Windows. Los materiales mantienen el sombreado toon y la paleta del museo.

## Organización del código

El código se agrupa en `game/`, `museum/`, `worlds/`, `rendering/` y `study/`.
Consultá el [codemap](docs/CODEMAP.md) para ubicar cada responsabilidad y seguir el flujo del juego.

## Documentación

- [Codemap](docs/CODEMAP.md): mapa breve del código y puntos de entrada.
- [Especificación maestra](docs/Proyecto_general.md): visión, dirección artística y recorrido completo del MVP.
- [Plan de desarrollo](docs/Plan_de_desarrollo.md): siete etapas independientes, entregables y criterios de aceptación.
- [Arquitectura prevista](docs/Arquitectura_prevista.md): áreas reordenables, progresión, fotografía y persistencia.

Las decisiones aclaradas en el plan —museo ficticio inspirado en el Louvre y circuito de cinco salas visitables en U— actualizan esos puntos de la especificación maestra. El resto de la especificación sigue vigente.
