# Museo de viajes en el tiempo

Proyecto de videojuego 3D en primera persona para navegador. El recorrido comienza en el andén de una plaza: al mirar atrás, el portón termina de cerrarse y el tren parte; el museo ficticio inspirado en el Louvre queda enfrente. Casas de uno y dos pisos, jardines y una baranda delimitan el patio. Se puede recibir un panfleto, recorrer un hall de piedra oscura con obras, vitrinas y luz cálida y completar Roma en la primera sala de un circuito en U. Las diez salas tienen lugar físico; Egipto y las otras ocho permanecen cerradas hasta instalar sus exhibiciones.

## Ejecutar el prototipo

Requiere Node.js 20.19 o posterior y npm.

```sh
npm install
npm run dev
```

Abrir la dirección local que muestra Vite y hacer clic en **Comenzar visita**. Usar **WASD** para caminar, mantener **Shift** para correr y mover el **mouse** para mirar. Acercarse al guardia junto a la entrada y pulsar **E** para recibir el panfleto; **M** lo despliega o guarda. En el hall, abrir la puerta 01 con **E**. Dentro de Roma, pulsar **C** para equipar la Polaroid y hacer **clic** para fotografiar el casco. Una foto válida lleva a la naumaquia; seguir la pasarela y recoger el casco con **E** para regresar y ver 1/10 en el panfleto. **Escape** pausa; hacer clic en **Volver al recorrido** recupera el control del mouse.

Para revisar el estilo de la etapa 1 sin caminar, abrir `?view=far`, `?view=mid` o `?view=near` al final de la dirección local. En ese modo se puede orbitar con el mouse, acercar con la rueda y cambiar entre las tres vistas. `npm run typecheck` revisa tipos y `npm run build` genera la versión estática en `dist/`.

El laboratorio temporal de la etapa 4 fue retirado de la experiencia pública. Roma es la única sala jugable en esta entrega; Egipto y las otras ocho siguen WIP. La puerta 02 permanece cerrada incluso después de completar Roma, hasta la etapa 7. El progreso todavía vive solo en la sesión: la persistencia local y la opción de reiniciar llegarán con Egipto. El modo de estudio conserva la fachada, la vegetación y el casco de gladiador de la etapa 1.

[Revisión visual y capturas de la etapa 1](docs/Revision_etapa_1.md).
[Revisión del recorrido de la etapa 2](docs/Revision_etapa_2.md).
[Revisión del museo y la introducción de la etapa 3](docs/Revision_etapa_3.md).
[Revisión de la Polaroid de la etapa 4](docs/Revision_etapa_4.md).
[Revisión de las diez salas de la etapa 5](docs/Revision_etapa_5.md).
[Revisión del ciclo romano de la etapa 6](docs/Revision_etapa_6.md).
[Renovación visual con modelos Kenney y capturas](docs/Revision_visual_Kenney.md).
[Inventario completo, selección y recomendaciones de assets](docs/Seleccion_Kenney.md).

La renovación incorpora 31 modelos de seis paquetes Kenney, con sus texturas y licencias CC0 en `public/assets/kenney/`. El juego carga esa selección local antes de habilitar la visita; no necesita acceder a la carpeta original de Windows. Los materiales mantienen el sombreado toon y la paleta del museo.

## Documentación

- [Especificación maestra](docs/Proyecto_general.md): visión, dirección artística y recorrido completo del MVP.
- [Plan de desarrollo](docs/Plan_de_desarrollo.md): siete etapas independientes, entregables y criterios de aceptación.
- [Arquitectura prevista](docs/Arquitectura_prevista.md): áreas reordenables, progresión, fotografía y persistencia.

Las decisiones aclaradas en el plan —museo ficticio inspirado en el Louvre y recorrido secuencial en U— actualizan esos puntos de la especificación maestra. El resto de la especificación sigue vigente.
