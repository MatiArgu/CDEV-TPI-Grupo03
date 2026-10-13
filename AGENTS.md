# AGENTS.md

Guía para asistentes de IA que colaboren en **Museo de viajes en el tiempo**.

Antes de trabajar, leer [CLAUDE.md](CLAUDE.md): sus principios de razonamiento, simplicidad, cambios acotados y verificación también se aplican aquí. [EXAMPLE.md](EXAMPLE.md) contiene ejemplos generales de esos principios; no describe la arquitectura de este juego.

## Estado del repositorio y fuentes de verdad

- Por ahora el repositorio contiene documentación y planificación. El juego, sus dependencias y sus comandos de ejecución todavía no existen.
- [README.md](README.md) resume el proyecto. [docs/Proyecto_general.md](docs/Proyecto_general.md) define la experiencia, la jugabilidad y la dirección artística.
- [docs/Plan_de_desarrollo.md](docs/Plan_de_desarrollo.md) divide el trabajo en siete entregas con criterios de aceptación. Sus decisiones aclaradas prevalecen sobre los puntos correspondientes de la especificación maestra. No implementar las siete entregas de una vez ni avanzar a la siguiente sin revisar la anterior.
- [docs/Arquitectura_prevista.md](docs/Arquitectura_prevista.md) fija decisiones transversales para catálogo, salas, fotografía, estados y guardado. Es una arquitectura prevista, no código existente.
- Ante una contradicción nueva o un requisito decisivo que falte, explicitarla antes de implementar. No presentar características planificadas como si ya funcionaran.

## Alcance del MVP

- Crear un videojuego 3D **jugable en navegador de escritorio**, en primera persona, basado en exploración, fotografía y viajes a momentos históricos congelados. No sustituir la interacción por un video o una maqueta.
- El museo es ficticio, con exterior inspirado en el Louvre. Tiene diez salas físicas visitables y representadas en el panfleto. Solo Roma y Egipto tendrán exhibición y mundo histórico jugables en el MVP; las otras ocho serán espacios WIP sin viaje temporal.
- Mantener la progresión Roma → Egipto para el orden inicial y saltar las salas WIP si se reordena el catálogo. La foto válida inicia el viaje; el área se completa al interactuar con el artefacto histórico y volver al museo.
- Preservar la mecánica central: la Polaroid captura lo que muestra el render, se revela y solo activa el viaje si el artefacto está visible dentro del encuadre, aunque esté en un borde. Una foto inválida también se revela y permite reintentar.
- Mantener la estética ilustrada *Stylized Hand-Drawn Anime 3D*: geometría low-poly, colores pastel, materiales toon, contornos selectivos y efectos livianos. Priorizar la calidad de la escena y del revelado sobre el tamaño de los mundos.
- Evitar combate, tercera persona, supervivencia, inventarios complejos y las ocho épocas adicionales durante este MVP.

## Implementación cuando corresponda a la etapa

- Usar Three.js, TypeScript y Vite; HTML/CSS para interfaces superpuestas cuando ayuden. No introducir otro motor, backend o dependencias grandes sin una necesidad acordada.
- Separar escena y render, controles y colisiones, interacción, fotografía, panfleto, progreso, transiciones, ayuda y audio. Compartir las mecánicas entre Roma y Egipto sin crear abstracciones especulativas.
- Dar a cada época un ID estable. `areaOrder` es la única fuente del orden: de él dependen sala física, número, señalización, panfleto y secuencia de activación. Separar disponibilidad WIP/jugable del progreso `locked`/`active`/`completed`; las WIP nunca se activan.
- Coordinar los estados de juego, cámara, panfleto, pausa y Pointer Lock para evitar acciones incompatibles. El guardado local, cuando se implemente, debe asociar progreso y fotos a IDs estables y permitir reiniciar.
- Liberar escenas y recursos que dejen de usarse. Preferir colisiones, luces y geometrías sencillas que funcionen con fluidez en navegadores modernos de escritorio.
- Mantener la documentación alineada con las decisiones implementadas, especialmente si cambia el alcance de una entrega o el contrato del catálogo.

## Flujo y verificación

- Elegir la entrega solicitada y revisar sus criterios de aceptación antes de editar. Mantener cambios pequeños y enfocados; no anticipar contenido de etapas posteriores salvo lo necesario para la entrega actual.
- No hacer commits directos a `main`. Usar una rama descriptiva para cambios que se vayan a integrar y mensajes Conventional Commits cuando se solicite un commit.
- Si solo cambia documentación, verificar enlaces, coherencia con los otros documentos y `git diff --check`. No afirmar que se ejecutó o compiló el juego mientras no exista código.
- Cuando exista código, ejecutar las comprobaciones disponibles de tipos y compilación, y probar en el navegador el recorrido afectado. Revisar visualmente cada escenario nuevo antes de seguir.
- Para fotografía y progreso, comprobar al menos los casos definidos en [Arquitectura prevista](docs/Arquitectura_prevista.md#pruebas-de-arquitectura-obligatorias): encuadre y oclusión, reordenamiento de Egipto, persistencia por ID, ayuda tras 20 segundos y controles durante transiciones.
- Antes de dar una entrega por terminada, contrastarla con su aceptación en el plan y comunicar lo que se verificó y lo que queda pendiente. No agregar secretos, archivos `.env` reales ni recursos sin permiso de uso.
