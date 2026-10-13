# AGENTS.md

Guía para asistentes que colaboren en **Museo de viajes en el tiempo**. Leer primero [CLAUDE.md](CLAUDE.md). [EXAMPLE.md](EXAMPLE.md) contiene ejemplos generales, no la arquitectura del juego.

## Fuentes de verdad

- El código y [package.json](package.json) describen lo que funciona hoy. [README.md](README.md) explica cómo jugar y ejecutar el proyecto; [docs/README.md](docs/README.md) organiza las guías vigentes.
- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) resume los contratos implementados; [docs/CODEMAP.md](docs/CODEMAP.md) ubica los módulos y [docs/VERIFICACION.md](docs/VERIFICACION.md) indica cómo comprobarlos.
- [docs/historico/](docs/historico/README.md) conserva planes, especificaciones, inventarios y revisiones anteriores. Sirve para rastrear decisiones; sus estados y metas antiguas no reemplazan al código ni a las guías actuales.
- Ante una contradicción nueva o un requisito decisivo que falte, explicitarlo antes de implementar. No presentar características planificadas como si ya funcionaran.

## Alcance actual

- Juego 3D de escritorio en navegador, en primera persona, con exploración, Polaroid y viajes a momentos históricos. Museo ficticio inspirado en el Louvre; cinco salas en U: Egipto, Roma, Medieval, Japón y Luna. Las cinco exhibiciones y los cinco viajes son jugables.
- `areaOrder` en [catalog.ts](src/game/catalog.ts) determina sala, número, señalización, panfleto y progresión. Conservar IDs estables. La disponibilidad de un viaje y su progreso son conceptos distintos; una sala pendiente puede recorrerse si se agrega en el futuro.
- La foto debe representar el render y solo iniciar el viaje si el artefacto es visible dentro del encuadre, incluso en un borde. La foto inválida también se revela. Se completa un área al cumplir su interacción histórica y regresar; en la Luna se aborda la nave y se despega.
- El panfleto físico, la Polaroid, la pausa, las transiciones y Pointer Lock comparten estados de control. El guardado local conserva panfleto y fotos por ID y permite reiniciar. Liberar recursos de cada mundo al salir.
- Mantener la estética low-poly ilustrada, materiales toon, colores pastel y efectos livianos. No sumar combate, tercera persona, supervivencia, inventario complejo, motor distinto o backend sin un pedido concreto.

## Trabajo y verificación

- Mantener cambios pequeños y documentación alineada con el comportamiento implementado. Los modelos Kenney incorporados tienen manifiesto y licencias en `public/assets/kenney/`; las fábricas de escenas requieren `loadModels()` antes de crear los escenarios.
- No hacer commits directos a `main`. Para integrar cambios, usar una rama descriptiva y Conventional Commits cuando se solicite un commit.
- Para cambios solo de documentación: revisar enlaces y coherencia, y ejecutar `git diff --check`.
- Para cambios de código: ejecutar `npm run typecheck` y `npm run build`; probar en navegador el recorrido afectado y revisar visualmente cada escenario nuevo. Para fotografía y progreso, seguir los [casos de verificación](docs/VERIFICACION.md).
- Comunicar qué se comprobó y qué queda pendiente. No agregar secretos, `.env` reales ni recursos sin permiso de uso.
