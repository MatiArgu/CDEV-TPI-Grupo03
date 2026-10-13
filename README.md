# Museo de viajes en el tiempo

Proyecto de videojuego 3D en primera persona para navegador. Las etapas 1 a 3 permiten recorrer el patio de un museo ficticio inspirado en el Louvre, recibir un panfleto y entrar al hall. Las salas históricas y los viajes temporales llegan en etapas posteriores.

## Ejecutar el prototipo

Requiere Node.js 20.19 o posterior y npm.

```sh
npm install
npm run dev
```

Abrir la dirección local que muestra Vite y hacer clic en **Comenzar visita**. Usar **WASD** para caminar y el **mouse** para mirar. Acercarse al guardia junto a la entrada y pulsar **E** para recibir el panfleto; **M** lo despliega o guarda. Después se puede entrar al hall y seguir la luz cálida hacia el futuro sector romano. **Escape** pausa; hacer clic en **Volver al recorrido** recupera el control del mouse.

Para revisar el estilo de la etapa 1 sin caminar, abrir `?view=far`, `?view=mid` o `?view=near` al final de la dirección local. En ese modo se puede orbitar con el mouse, acercar con la rueda y cambiar entre las tres vistas. `npm run typecheck` revisa tipos y `npm run build` genera la versión estática en `dist/`.

El modo de estudio conserva la fachada, la vegetación y el casco de gladiador de la etapa 1. En el recorrido principal todavía no hay salas históricas, fotografía ni viajes temporales.

[Revisión visual y capturas de la etapa 1](docs/Revision_etapa_1.md).
[Revisión del recorrido de la etapa 2](docs/Revision_etapa_2.md).
[Revisión del museo y la introducción de la etapa 3](docs/Revision_etapa_3.md).

## Documentación

- [Especificación maestra](docs/Proyecto_general.md): visión, dirección artística y recorrido completo del MVP.
- [Plan de desarrollo](docs/Plan_de_desarrollo.md): siete etapas independientes, entregables y criterios de aceptación.
- [Arquitectura prevista](docs/Arquitectura_prevista.md): áreas reordenables, progresión, fotografía y persistencia.

Las decisiones aclaradas en el plan —museo ficticio inspirado en el Louvre, salas WIP accesibles y salto de áreas incompletas— actualizan esos puntos de la especificación maestra. El resto de la especificación sigue vigente.
