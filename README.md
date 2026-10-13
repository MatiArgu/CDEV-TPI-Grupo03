# Museo de viajes en el tiempo

Juego 3D de exploración en primera persona para navegador de escritorio, hecho con Three.js, TypeScript y Vite. La visita empieza en un patio junto a una estación y continúa en un museo ficticio inspirado en el Louvre. Sus cinco salas forman un circuito en U: Egipto → Roma → Medieval → Japón Feudal → Luna.

Cada sala tiene un objeto para fotografiar con la Polaroid. Una foto válida inicia el viaje; recuperar el objeto en el mundo histórico y volver al museo guarda el recuerdo en el panfleto. En la Luna, el regreso se realiza a bordo de la nave. El progreso queda en el navegador local, sin cuenta ni servidor.

## Ejecutar

Requiere Node.js 20.19+ y npm. Las pruebas automatizadas de navegador requieren Node.js 22+ y Chrome/Chromium.

```sh
npm install
npm run dev
```

Abrí la dirección que muestra Vite y elegí **Comenzar visita**. Para comprobar tipos y generar `dist/`:

```sh
npm run typecheck
npm run build
```

## Controles

| Acción | Control |
| --- | --- |
| Caminar, mirar, correr | WASD, mouse, Shift |
| Interactuar con guardia, puertas y objetos | E |
| Equipar o guardar la Polaroid, disparar | C, clic |
| Levantar o guardar el panfleto | M; también clic para guardarlo |
| Pausar | Escape |

El guardia entrega el panfleto en el hall. Abrirlo libera el cursor; cerrarlo vuelve a capturarlo. Una foto inválida también se revela y permite reintentar. La ayuda de ruta aparece después de 20 segundos en cada viaje. **Reiniciar visita** borra, previa confirmación, la partida guardada por este juego en ese navegador. Una visita histórica interrumpida antes del regreso no se registra como completa.

## Documentación

- [Índice de documentación](docs/README.md): guías vigentes y registros históricos.
- [Codemap](docs/CODEMAP.md): dónde está cada responsabilidad.
- [Arquitectura](docs/ARQUITECTURA.md): catálogo, fotografía, estados y guardado.
- [Verificación](docs/VERIFICACION.md): comandos y alcance de las pruebas.
- [Assets Kenney](docs/ASSETS_KENNEY.md): selección incorporada y procedencia.

Los modelos necesarios ya están en `public/assets/kenney/`; para jugar no hace falta la carpeta original de Kenney.
