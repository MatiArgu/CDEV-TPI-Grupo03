# Museo de viajes en el tiempo

Proyecto de videojuego 3D en primera persona para navegador. Están implementadas la **etapa 1: motor visual** y la **etapa 2: movimiento** en una escena de prueba en Three.js. El museo y los viajes temporales llegan en etapas posteriores.

## Ejecutar el prototipo

Requiere Node.js 20.19 o posterior y npm.

```sh
npm install
npm run dev
```

Abrir la dirección local que muestra Vite y hacer clic en **Entrar al recorrido**. Usar **WASD** para caminar, el **mouse** para mirar y **E** para inspeccionar el casco cuando aparezca la indicación. **Escape** pausa o cierra la ficha; hacer clic en **Volver al recorrido** recupera el control del mouse.

Para revisar el estilo de la etapa 1 sin caminar, abrir `?view=far`, `?view=mid` o `?view=near` al final de la dirección local. En ese modo se puede orbitar con el mouse, acercar con la rueda y cambiar entre las tres vistas. `npm run typecheck` revisa tipos y `npm run build` genera la versión estática en `dist/`.

La escena contiene una fachada ficticia, vegetación y un casco de gladiador de prueba. Todavía no hay fotografía, salas completas ni viajes temporales.

[Revisión visual y capturas de la etapa 1](docs/Revision_etapa_1.md).
[Revisión del recorrido de la etapa 2](docs/Revision_etapa_2.md).

## Documentación

- [Especificación maestra](docs/Proyecto_general.md): visión, dirección artística y recorrido completo del MVP.
- [Plan de desarrollo](docs/Plan_de_desarrollo.md): siete etapas independientes, entregables y criterios de aceptación.
- [Arquitectura prevista](docs/Arquitectura_prevista.md): áreas reordenables, progresión, fotografía y persistencia.

Las decisiones aclaradas en el plan —museo ficticio inspirado en el Louvre, salas WIP accesibles y salto de áreas incompletas— actualizan esos puntos de la especificación maestra. El resto de la especificación sigue vigente.
