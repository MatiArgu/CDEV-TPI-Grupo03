# Inventario y selección de Kenney

Revisión del 13 de octubre de 2026. Fuente local: `Kenney Game Assets All-in-1 3.7.0`.

## Cobertura de la exploración

Se recorrieron recursivamente **91.040 archivos**, incluyendo las carpetas `2D assets`, `3D assets`, `Archive`, `Audio`, `Early access`, `Goodies`, `Icons`, `Other` y `UI assets`, además de los archivos raíz. Se revisaron el catálogo JSON, los nombres y formatos, las vistas previas disponibles de los paquetes y las licencias de todos los recursos incorporados. Se listaron también las **14.490 entradas de los 52 ZIP**, sin extraerlas al proyecto.

Hay **5.314 archivos GLB/glTF** sueltos; esta cifra incluye variantes y no representa modelos únicos. Los ZIP contienen otras 504 representaciones en formatos 3D. Los **54 paquetes 3D principales** y los dos de Early access se revisaron mediante sus vistas previas; los 28 modelos elegidos se cargaron e inspeccionaron en Three.js. No se renderizaron individualmente todos los modelos del catálogo.

- [Inventario completo por carpeta y formato](Inventario_Kenney.csv).
- [Inventario de archivos comprimidos](Inventario_Kenney_zip.csv).
- [Manifiesto de modelos incorporados](../public/assets/kenney/manifest.json): origen exacto, tamaño, SHA-256, licencia y texturas dependientes.

## Selección implementada

| Paquete | Modelos | Uso |
| --- | ---: | --- |
| Nature Kit | 15 | Árboles con raíces y ramas, jardineras, arbustos, flores, piedras y vegetación del estudio. |
| Furniture Kit | 4 | Bancos de patio, bancos tapizados y plantas del hall. |
| Mini Arena | 9 | Esculturas, columnas acanaladas, fragmentos, estandartes, soldados y lanzas decorativas de Roma. |
| Pirate Kit | 5 | Casco de bote de remos, remos, tablones, barriles y cajas para las embarcaciones de la naumaquia. |
| Modular Buildings | 2 | Marcos de ventanas altas y arqueadas para fachada y hall. |
| Train Kit | 3 | Locomotora clásica, vagón de pasajeros y vías rectas del andén. |
| Castle Kit | 6 | Murallas, torres, cubiertas, portón, estandartes y catapulta medieval. |
| Mini Dungeon | 6 | Llave, cofre, escudo, espada, mesa y personaje medieval. |
| Graveyard Kit | 1 | Urna sin símbolos funerarios, adaptada a Egipto. |

La selección actual contiene **51 modelos de nueve paquetes**: 31 anteriores, 19 añadidos para Medieval y las mejoras de Egipto/Roma, y un bambú para Japón. Los GLB suman **1.425.036 bytes**, con siete texturas de paleta externas. Las nueve licencias originales son CC0 y se conservan junto a los modelos; el manifiesto registra tamaño, origen y SHA-256 de cada archivo. Los originales de Windows no se modificaron.

### Ampliación medieval y mejoras de Egipto/Roma

Se revisaron las vistas previas y modelos de Castle Kit, Mini Dungeon, Mini Arena y Nature Kit, además de las urnas de Graveyard Kit y alternativas de Fantasy Town Kit. Se eligieron 19 GLB (570.044 bytes adicionales):

- **Medieval:** llave como artefacto, cofre, escudos, espadas, figuras de piedra y maqueta. El viaje utiliza los mismos módulos para una fortaleza con catapulta y guardias inmóviles.
- **Egipto:** dos palmeras, obelisco y urna. Se mantienen propios el escarabajo, faraones, sarcófago, columnas y templo para conservar su identidad.
- **Roma:** gladius, trofeo y armero. Se conserva el casco fotografiable propio y el tamaño de la sala.

La revisión visual de los modelos seleccionados se hizo en el juego. No se afirma que se hayan renderizado individualmente todos los modelos del catálogo.

Los colores se adaptan en ejecución y los materiales se convierten a `MeshToonMaterial`. Las esculturas y columnas reciben tonos de piedra y contornos discretos. Las figuras usan esqueletos independientes. Los archivos originales del catálogo permanecen intactos.

## Recomendaciones para las piezas propias

- **Casco:** conservar una pieza propia, compartida entre estudio, exhibición y mundo histórico. Se renovaron cúpula, visera, carrilleras, remaches y cresta; el catálogo no aporta un casco independiente equivalente listo para reemplazar el artefacto.
- **Polaroid:** conservar el modelo propio. Se añadieron bordes redondeados, visor, correa, franjas y marca ficticia. Las cámaras de Racing Kit pertenecen a otro contexto y requieren adaptación; no son una Polaroid.
- **Guardia:** conservar el trabajo local de uniforme y entrega animada. Los paquetes Animated Characters ofrecen otra base posible, pero cambiar de personaje exige adaptar proporciones, uniforme y animación. No mejora automáticamente el guardia actual.
- **Museo:** combinar marcos del catálogo con arquitectura propia. Los edificios completos de ciudad no resuelven la entrada, el tragaluz ni el circuito en U.
- **Naumaquia:** reutilizar solo las piezas compatibles. Los barcos piratas completos incorporan rasgos de otra época; se construyeron embarcaciones estilizadas con remos, mástil y vela rectangular a partir del bote básico.

## Recursos recomendados para trabajos futuros

| Necesidad | Recursos locales | Adaptación necesaria |
| --- | --- | --- |
| Más detalles egipcios | Building Kit y piezas naturales compatibles | Palmeras, obelisco y urnas ya incorporados; conservar los artefactos y la arquitectura temática propios. |
| Detalles ilustrados del panfleto | Cartography Pack, Map Pack, Pattern Pack Lines | Usar iconos y ornamentos; mantener el mapa generado desde `areaOrder`. |
| Polvo y acentos de transición | Particle Pack, Light Masks | Pocas partículas con colores del juego y sin tapar el encuadre. |
| Cielo ilustrado | Skyboxes | Revisar tono y orientación contra la iluminación del museo antes de sustituir el fondo. |
| Indicaciones de teclado | Input Prompts | Seleccionar únicamente teclado/mouse de escritorio; conservar el HUD discreto. |
| Sonido en etapa 7 | Foley Sounds, RPG Audio, Interface Sounds | Escuchar y seleccionar; esta revisión visual no incorpora ni valida audio. |
| Mobiliario adicional | Furniture Kit; urnas y bancos de Graveyard Kit sin motivos funerarios | Selección contextual y ajuste de paleta, escala y colisiones. |
| Épocas posteriores al MVP | Castle Kit, Fantasy Town Kit, Space Kit, Watercraft Pack | Solo referencias para entregas futuras; no habilitan las salas WIP. |

Los paquetes pixel art, isométricos prerenderizados, plataformas, carreras, armas modernas, ciencia ficción y UI de combate no encajan directamente con la dirección de este recorrido. No conviene incorporarlos solo para aumentar la cantidad de objetos.

## Paquetes 3D revisados

Los conteos corresponden a archivos por formato, incluyendo variantes.

| Paquete | GLB/glTF | OBJ | FBX | Decisión para esta revisión |
| --- | ---: | ---: | ---: | --- |
| Animated Characters Bundle | 0 | 0 | 62 | Alternativa de personaje que exige adaptar uniforme, proporciones y animaciones. |
| Animated Characters Protagonists | 0 | 0 | 4 | Alternativa de personaje que exige adaptar uniforme, proporciones y animaciones. |
| Animated Characters Retro | 0 | 0 | 4 | Alternativa de personaje que exige adaptar uniforme, proporciones y animaciones. |
| Animated Characters Survivors | 0 | 0 | 4 | Alternativa de personaje que exige adaptar uniforme, proporciones y animaciones. |
| Blaster Kit | 40 | 40 | 40 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Blocky Characters | 18 | 18 | 18 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Brick Kit | 296 | 296 | 296 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Building Kit | 79 | 79 | 79 | Arquitectura modular alternativa; mantener recorridos y escala propios. |
| Car Kit | 50 | 50 | 50 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Castle Kit | 76 | 76 | 76 | Arquitectura para la época medieval futura. |
| City Kit - Commercial | 41 | 41 | 41 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| City Kit - Industrial | 25 | 25 | 25 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| City Kit - Roads | 95 | 95 | 95 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| City Kit - Suburban | 40 | 40 | 40 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Coaster Kit | 183 | 183 | 183 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Cube Pets | 24 | 24 | 24 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Factory Kit | 143 | 143 | 143 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Fantasy Town Kit | 167 | 167 | 167 | Mobiliario y construcciones para épocas futuras. |
| Food Kit | 200 | 200 | 200 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Furniture Kit | 140 | 140 | 140 | Integrado; ver selección y manifiesto. |
| Graveyard Kit | 91 | 91 | 91 | Urnas y bancos candidatos, excluyendo motivos funerarios. |
| Hexagon Kit | 72 | 72 | 72 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Holiday Kit | 99 | 99 | 99 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Marble Kit | 162 | 162 | 162 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Mini Arcade | 20 | 20 | 20 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Mini Arena | 22 | 22 | 22 | Integrado; ver selección y manifiesto. |
| Mini Characters | 26 | 26 | 26 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Mini Dungeon | 30 | 30 | 30 | Columnas y escudos candidatos; ambientación de mazmorra. |
| Mini Forest | 22 | 22 | 22 | Alternativa más caricaturesca de vegetación y muelles. |
| Mini Market | 20 | 20 | 20 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Mini Skate | 20 | 20 | 20 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Minigolf Kit | 126 | 126 | 126 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Modular Buildings | 108 | 108 | 108 | Integrado; ver selección y manifiesto. |
| Modular Cave Kit | 40 | 40 | 40 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Modular Dungeon Kit | 39 | 39 | 39 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Modular Space Kit | 40 | 40 | 40 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Nature Kit | 329 | 329 | 329 | Integrado; ver selección y manifiesto. |
| Nature Kit (Classic) | 232 | 232 | 232 | Alternativa de vegetación; se eligió Nature Kit actual. |
| Pirate Kit | 72 | 72 | 72 | Integrado; ver selección y manifiesto. |
| Platformer Kit | 153 | 153 | 153 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Prototype Kit | 145 | 145 | 145 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Racing Kit | 112 | 112 | 112 | Cámara y utilería de carreras; no sustituyen la Polaroid. |
| Retro Fantasy Kit | 160 | 105 | 105 | Texturas retro que requieren rediseño para esta estética. |
| Retro Urban Kit | 124 | 124 | 124 | Texturas retro y contexto urbano moderno. |
| Road Pack | 294 | 294 | 294 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Space Kit | 153 | 153 | 153 | Referencia para sala lunar futura, fuera del MVP. |
| Space Station Kit | 177 | 97 | 97 | Interiores espaciales, fuera del MVP. |
| Survival Kit | 80 | 80 | 80 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Tower Defense (Classic) | 119 | 119 | 119 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Tower Defense Kit | 160 | 160 | 160 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Toy Car Kit | 157 | 157 | 157 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Train Kit | 103 | 103 | 103 | Integrado en la llegada al museo: locomotora, vagón y vías. |
| Watercraft Pack | 46 | 46 | 46 | Embarcaciones para futuras épocas; varios modelos modernos o piratas. |
| Weapon Pack | 37 | 37 | 37 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Medieval Weapons (Early access) | 17 | 17 | 17 | Sin uso en los escenarios actuales; temática o estilo ajenos al recorrido. |
| Racing Kit (Early access) | 68 | 68 | 68 | Cámara y utilería de carreras; no sustituyen la Polaroid. |

## Implementación y verificación

El estado actual incluye Egipto, Roma, Medieval y Japón jugables, con persistencia local por ID. Luna permanece visitable sin viaje. [Revisión visual, capturas y pruebas](Revision_visual_Kenney.md).


### Selección para Japón

Se buscaron modelos japoneses, torii, katanas, cerezos y bambú en el catálogo local. Se añadió `Nature Kit/crops_bambooStageB.glb`, con la licencia CC0 ya incluida. Se reutilizan arbustos, rocas y árboles verdes importados. La máscara Oni roja, las katanas, cerezos, linternas, torii y arquitectura del templo son geometrías propias en `rendering/japanese.ts`; no se presentan como modelos originales de Kenney. Las piezas mantienen materiales toon y se agrupan cuando son estáticas.
