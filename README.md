# Museo de viajes en el tiempo

Proyecto de videojuego 3D en primera persona para navegador. Está implementada la **etapa 1: motor visual** como una escena de prueba en Three.js. El recorrido jugable comienza en etapas posteriores.

## Ejecutar el estudio visual

Requiere Node.js 20.19 o posterior y npm.

```sh
npm install
npm run dev
```

Abrir la dirección local que muestra Vite. Los botones **Lejos**, **Medio** y **Cerca** cambian la distancia de inspección; también se puede orbitar con el mouse y acercar con la rueda. `npm run typecheck` revisa tipos y `npm run build` genera la versión estática en `dist/`.

La escena contiene una fachada ficticia, vegetación y un casco de gladiador de prueba. Todavía no hay movimiento en primera persona, fotografía, salas ni viajes temporales.

[Revisión visual y capturas de la etapa 1](docs/Revision_etapa_1.md).

## Documentación

- [Especificación maestra](docs/Proyecto_general.md): visión, dirección artística y recorrido completo del MVP.
- [Plan de desarrollo](docs/Plan_de_desarrollo.md): siete etapas independientes, entregables y criterios de aceptación.
- [Arquitectura prevista](docs/Arquitectura_prevista.md): áreas reordenables, progresión, fotografía y persistencia.

Las decisiones aclaradas en el plan —museo ficticio inspirado en el Louvre, salas WIP accesibles y salto de áreas incompletas— actualizan esos puntos de la especificación maestra. El resto de la especificación sigue vigente.
