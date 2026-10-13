# Museo de viajes en el tiempo

Proyecto de videojuego 3D en primera persona para navegador. El recorrido actual permite explorar el patio de un museo ficticio inspirado en el Louvre, recibir un panfleto, entrar al hall y visitar diez salas vacías en preparación. La Polaroid se probó en la etapa 4 y se integrará al recorrido histórico en una entrega posterior.

## Ejecutar el prototipo

Requiere Node.js 20.19 o posterior y npm.

```sh
npm install
npm run dev
```

Abrir la dirección local que muestra Vite y hacer clic en **Comenzar visita**. Usar **WASD** para caminar y el **mouse** para mirar. Acercarse al guardia junto a la entrada y pulsar **E** para recibir el panfleto; **M** lo despliega o guarda. Después se puede entrar al hall, seguir el corredor central y recorrer las diez salas. Sus números, colores y posiciones coinciden con el panfleto. La luz cálida señala la sala de Roma. **Escape** pausa; hacer clic en **Volver al recorrido** recupera el control del mouse.

Para revisar el estilo de la etapa 1 sin caminar, abrir `?view=far`, `?view=mid` o `?view=near` al final de la dirección local. En ese modo se puede orbitar con el mouse, acercar con la rueda y cambiar entre las tres vistas. `npm run typecheck` revisa tipos y `npm run build` genera la versión estática en `dist/`.

El laboratorio temporal de la etapa 4 fue retirado de la experiencia pública. Las diez salas actuales son WIP: no tienen exhibiciones, fotografía ni viajes temporales. El modo de estudio conserva la fachada, la vegetación y el casco de gladiador de la etapa 1.

[Revisión visual y capturas de la etapa 1](docs/Revision_etapa_1.md).
[Revisión del recorrido de la etapa 2](docs/Revision_etapa_2.md).
[Revisión del museo y la introducción de la etapa 3](docs/Revision_etapa_3.md).
[Revisión de la Polaroid de la etapa 4](docs/Revision_etapa_4.md).
[Revisión de las diez salas de la etapa 5](docs/Revision_etapa_5.md).

## Documentación

- [Especificación maestra](docs/Proyecto_general.md): visión, dirección artística y recorrido completo del MVP.
- [Plan de desarrollo](docs/Plan_de_desarrollo.md): siete etapas independientes, entregables y criterios de aceptación.
- [Arquitectura prevista](docs/Arquitectura_prevista.md): áreas reordenables, progresión, fotografía y persistencia.

Las decisiones aclaradas en el plan —museo ficticio inspirado en el Louvre, salas WIP accesibles y salto de áreas incompletas— actualizan esos puntos de la especificación maestra. El resto de la especificación sigue vigente.
