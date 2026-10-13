# Desarrollo de videojuego 3D en Three.js — Museo de viajes en el tiempo

Quiero que actúes como un desarrollador senior de videojuegos web especializado en Three.js, diseño de experiencias interactivas 3D, shaders estilizados y arquitectura de videojuegos.

Tu objetivo es **desarrollar un videojuego 3D funcional y jugable en el navegador**, utilizando Three.js, con una dirección artística muy específica y una mecánica central basada en fotografías, viajes en el tiempo y exploración.

**IMPORTANTE:** No quiero un video, un tráiler, una animación predefinida ni una maqueta visual sin funcionalidad. Quiero un videojuego real, con movimiento en primera persona, escenarios 3D explorables, interacciones, objetivos, transiciones, progreso y una experiencia completa de principio a fin.

El alcance inicial será un MVP con dos épocas históricas completamente jugables: Roma y Egipto.

---

# 1. DIRECCIÓN ARTÍSTICA — PRIORIDAD MUY ALTA

El videojuego debe tener un estilo visual **Stylized Hand-Drawn Anime 3D**, una combinación de escenarios 3D low-poly, estética de ilustración 2D, colores pastel y sombreado cel-shading.

La inspiración visual es la de un videojuego indie japonés con entornos dibujados a mano y elementos tridimensionales.

El objetivo no es crear gráficos realistas, sino lograr que el jugador sienta que está recorriendo una ilustración animada en tres dimensiones.

## Características visuales

- Geometrías low-poly con siluetas orgánicas y ligeramente irregulares.
- Estética híbrida 2D/3D, donde el mundo parece una ilustración dibujada a mano.
- Colores pastel suaves y ligeramente desaturados.
- Contornos finos y oscuros alrededor de personajes, edificios y objetos importantes.
- Líneas de apariencia artesanal, ligeramente imperfectas.
- Materiales de colores planos, sin texturas fotorrealistas.
- Cel-shading con dos o tres niveles definidos de iluminación.
- Sombras grandes y simplificadas, similares a manchas de pintura.
- Iluminación ambiental suave y atmosférica.
- Edificios, arquitectura y vegetación estilizados.
- Pequeñas imperfecciones visuales que eviten que todo parezca generado mediante primitivas geométricas perfectas.

## Paleta cromática general

Utilizar aproximadamente:

- Mint green: #8DDCCB
- Turquoise: #64C7B8
- Natural green: #4DA575
- Warm cream: #E7EAD8
- Sage green: #B5C6AC
- Pale sand: #F0CC9C
- Coral: #E58362
- Dark ink: #34383A

Esta paleta representa la identidad visual general. Cada época podrá introducir tonos adicionales:

**Museo:** crema, verde grisáceo, turquesa apagado, iluminación cálida.

**Roma:** piedra clara, terracota, coral, verdes desaturados y tonos arena.

**Egipto:** amarillo arena, beige, ocre, turquesa y dorado apagado.

Mantener coherencia artística entre todos los escenarios.

## Implementación visual en Three.js

Priorizar:

- `MeshToonMaterial` para materiales principales.
- Shaders personalizados sencillos cuando realmente aporten valor.
- Contornos selectivos utilizando técnicas compatibles con Three.js.
- `AmbientLight` y `DirectionalLight`.
- Geometrías low-poly personalizadas.
- Colores planos e irregularidades dibujadas sobre las superficies.
- Sombras estilizadas.
- Efectos de partículas livianos.
- Iluminación ambiental que genere atmósfera sin requerir renderizado físicamente realista.

Evitar:

- Gráficos fotorrealistas.
- Materiales metálicos o reflectivos demasiado detallados.
- Ray tracing.
- Texturas fotográficas.
- Modelos 3D extremadamente complejos.
- Bloom exagerado.
- Efectos visuales costosos.
- Escenarios visualmente vacíos o compuestos únicamente por cubos sin personalidad.

**El resultado debe sentirse ilustrado, no renderizado.**

---

# 2. CONCEPTO DEL VIDEOJUEGO

El jugador visita el Museo del Louvre en París.

Sin embargo, descubre que el museo tiene una característica extraordinaria: mediante una cámara fotográfica Polaroid puede ingresar físicamente a momentos históricos congelados en el tiempo.

El objetivo es explorar diez áreas históricas del museo, viajar a sus respectivas épocas y recuperar simbólicamente un objeto específico de cada una.

Cada área tiene un artefacto asociado.

El jugador debe fotografiar una escena que incluya dicho artefacto para activar el viaje temporal.

Una vez dentro de la época histórica, debe recorrer un escenario lineal, encontrar el artefacto y tocarlo para regresar al museo.

El progreso queda registrado en un panfleto entregado al comenzar el juego.

## Filosofía del gameplay

El juego debe ser principalmente una experiencia de:

- Exploración.
- Observación.
- Fotografía.
- Descubrimiento.
- Viajes históricos.
- Narrativa ambiental.

No debe tener combate, enemigos que ataquen, sistemas de supervivencia, habilidades especiales o mecánicas excesivamente complejas.

Debe ser sencillo de comprender, atmosférico y visualmente atractivo.

---

# 3. PERSPECTIVA Y MOVIMIENTO

**El videojuego ocurre exclusivamente en primera persona.**

El jugador nunca puede ver su propio personaje desde afuera.

No implementar una cámara en tercera persona.

Se permiten manos estilizadas cuando el personaje interactúa con la cámara, el panfleto o algún objeto.

## Controles propuestos

- WASD: movimiento.
- Mouse: rotación de cámara.
- E: interactuar.
- C: equipar o guardar cámara Polaroid.
- Click izquierdo: tomar fotografía cuando la cámara está equipada.
- M: abrir o cerrar el panfleto.
- ESC: liberar el mouse o abrir pausa.

Utilizar Pointer Lock API para controlar la cámara.

El movimiento debe sentirse natural, similar al de un juego de exploración en primera persona.

Implementar colisiones básicas para impedir que el jugador atraviese paredes, vitrinas y objetos sólidos.

No es necesario agregar salto, correr o agacharse en el MVP.

La cámara debe tener una altura coherente con la perspectiva humana.

El movimiento de cabeza debe ser muy sutil.

---

# 4. OBJETOS DEL JUGADOR

Durante toda la experiencia el jugador tendrá únicamente dos herramientas:

## A. Panfleto del museo

Es el elemento central para consultar y representar el progreso.

Debe ser un objeto físico estilizado que aparece frente a la cámara cuando el jugador lo abre.

No quiero que sea simplemente un menú tradicional ocupando toda la pantalla.

Debe parecer un papel desplegable ilustrado, como un mapa turístico.

El panfleto contiene:

- Un mapa simplificado del museo.
- Diez áreas históricas numeradas.
- Indicación visual del área actualmente activa.
- Las áreas completadas.
- Espacios donde se colocan las fotografías Polaroid y los artefactos recolectados.

El jugador lo recibe del guardia al comenzar.

Debe permanecer disponible durante toda la partida.

## B. Cámara Polaroid

La cámara debe ser un modelo 3D estilizado, sencillo y reconocible.

Al equiparla aparece en primer plano.

La cámara permite apuntar y tomar fotografías de los escenarios.

Cuando se toma una foto:

1. Suena el obturador.
2. Se genera una fotografía Polaroid.
3. La fotografía aparece inicialmente desenfocada.
4. Se desarrolla progresivamente.
5. La imagen se vuelve nítida.
6. Si la fotografía contiene el artefacto histórico requerido, comienza la transición temporal.

**La fotografía debe corresponder a lo que el jugador realmente estaba viendo al disparar.**

Para el MVP, implementar la captura visual mediante el render de Three.js y presentar el resultado como una Polaroid utilizando HTML/CSS o una solución equivalente.

No utilizar una imagen predeterminada que ignore lo que el jugador fotografió.

---

# 5. INICIO DEL JUEGO — MUSEO DEL LOUVRE

La partida comienza en el exterior del Museo del Louvre.

No hace falta reproducir el Louvre con precisión arquitectónica absoluta.

Crear una versión reconocible y estilizada, con:

- Fachada clásica simplificada.
- Pirámide de cristal.
- Patio exterior.
- Entrada principal.
- Algunos detalles decorativos.

El jugador puede caminar hasta la entrada.

Un guardia de seguridad estilizado espera junto a la puerta.

Al acercarse, aparece una indicación discreta para interactuar.

Cuando el jugador presiona E, el guardia le entrega el panfleto.

Puede utilizarse una animación sencilla de brazos y un pequeño diálogo.

Una vez recibido, se habilita el ingreso al museo.

## Interior del museo

El jugador ingresa a un hall amplio y silencioso.

Características:

- Arquitectura clásica simplificada.
- Columnas.
- Arcos.
- Pisos de piedra.
- Estatuas.
- Vitrinas.
- Pasillos hacia diferentes áreas históricas.
- Señalización ilustrada.

Inicialmente, todas las áreas están oscuras.

El jugador abre el panfleto y observa las diez áreas.

Entonces, se ilumina la primera área disponible: **Roma Antigua**.

La iluminación debe dirigir naturalmente la atención del jugador.

No utilizar flechas gigantes, marcadores invasivos ni una interfaz saturada.

El jugador puede caminar hacia el área iluminada.

---

# 6. SISTEMA DE ÁREAS DEL MUSEO

El museo contiene diez áreas.

El sistema debe diseñarse para incorporar nuevas épocas en el futuro, pero solamente las siguientes dos deben implementarse por completo:

1. Roma Antigua.
2. Egipto Antiguo.

Las otras ocho estarán representadas en el mapa y podrán existir como entradas cerradas o inactivas, pero no necesitan escenarios desarrollados.

## Estados de un área

Cada área puede encontrarse en uno de estos estados:

- `locked`: bloqueada y sin iluminar.
- `active`: iluminada y accesible.
- `completed`: finalizada, con fotografía y artefacto registrados en el panfleto.

Solamente puede existir una área activa por vez.

Al completar un área:

1. El jugador regresa al museo.
2. Se actualiza el panfleto.
3. Se registra la Polaroid obtenida.
4. Se agrega una representación ilustrada del artefacto.
5. Se apagan las luces de esa sección.
6. Se ilumina la siguiente área.

Mantener esta progresión secuencial.

---

# 7. ÁREA 1 — ROMA ANTIGUA

## A. Exhibición dentro del museo

Construir una sala romana explorabe en 3D.

Elementos sugeridos:

- Bustos romanos.
- Columnas rotas.
- Escudos.
- Estatuas.
- Fragmentos arquitectónicos.
- Vitrinas.
- Casco de gladiador.

El artefacto principal de esta época es un **casco de gladiador**.

Este casco debe formar parte de la exhibición y estar visualmente integrado al escenario.

No debe parecer un objeto flotante de videojuego.

## B. Mecánica fotográfica

Para acceder a Roma, el jugador debe sacar una fotografía donde aparezca el casco de gladiador.

**IMPORTANTE:**

No es necesario que el casco esté exactamente en el centro de la fotografía.

Puede formar parte de una composición más amplia, pero debe encontrarse dentro del encuadre y ser visible.

Implementar un sistema que determine si el artefacto requerido aparece dentro del campo de visión de la cámara fotográfica y no está oculto detrás de una pared u otro elemento sólido.

Si el casco no aparece en la fotografía, la foto no activa el viaje y el jugador puede intentarlo nuevamente.

No revelar excesivamente el requisito mediante una interfaz. La mecánica debe poder descubrirse mediante exploración, composición visual y pistas ambientales discretas.

## C. Desarrollo de la Polaroid

Al obtener una fotografía válida:

- Se muestra la Polaroid.
- La imagen comienza borrosa.
- Se vuelve nítida gradualmente.
- La fotografía ocupa progresivamente el campo de visión.
- La escena se transforma en el mundo histórico.

El efecto debe parecer mágico, pero estar implementado con técnicas simples y eficientes.

No utilizar portales complejos.

---

# 8. MUNDO HISTÓRICO — ROMA

El jugador aparece en un escenario inspirado en el Coliseo romano, durante una representación estilizada de una batalla naval en una arena inundada.

El mundo debe ser 3D y explorable.

Sin embargo, **el tiempo está prácticamente detenido**.

## Diseño del escenario

Elementos sugeridos:

- Estructura del Coliseo.
- Embarcaciones romanas.
- Soldados y gladiadores.
- Escudos.
- Armas.
- Banderas.
- Gradas.
- Agua simplificada.
- Salpicaduras suspendidas en el aire.

No implementar sistemas complejos de navegación naval ni simulación física del agua.

Representar el agua mediante superficies estilizadas con colores planos y ligeras variaciones.

Los personajes históricos pueden ser modelos low-poly simples colocados en poses estáticas.

Algunas partículas, banderas y elementos ambientales pueden moverse muy lentamente.

La escena debe parecer **una pintura tridimensional de un momento histórico congelado**.

## Objetivo

El jugador debe recorrer un camino principalmente lineal a través del escenario para encontrar el casco de gladiador.

No puede combatir ni modificar el mundo.

Puede observar y caminar.

El recorrido debe tener cierto interés visual: barcos, gladiadores inmóviles, objetos suspendidos y arquitectura monumental.

Al final del recorrido, el casco de gladiador estará ubicado en un lugar reconocible.

Al acercarse y presionar E, el jugador interactúa con él.

Esta interacción provoca el regreso al museo.

---

# 9. SISTEMA DE AYUDA DESPUÉS DE 20 SEGUNDOS

Este sistema debe funcionar en todos los mundos históricos.

Cuando el jugador aparece en una época histórica, comienza un contador interno.

Si transcurren 20 segundos sin encontrar el artefacto, debe activarse una ayuda visual.

Por ejemplo:

- Pequeñas marcas luminosas sobre el suelo.
- Un camino discretamente iluminado.
- Una serie de partículas que indican la dirección correcta.
- Un resaltado sutil del artefacto cuando está cerca.

La ayuda debe ser coherente con el estilo ilustrado.

No utilizar flechas enormes ni indicadores que rompan la inmersión.

El camino debe guiar hacia el artefacto por una ruta transitable, evitando señalar directamente a través de paredes.

Si el jugador encuentra el artefacto antes de los 20 segundos, la ayuda nunca aparece.

Este temporizador solamente funciona dentro de los mundos históricos.

---

# 10. REGRESO DE ROMA Y PROGRESIÓN

Cuando el jugador toca el casco:

1. Se activa una transición visual breve.
2. El jugador regresa a la sala romana del museo.
3. Se abre o actualiza el panfleto.
4. La Polaroid tomada aparece adherida al área romana del mapa.
5. Una pequeña ilustración del casco aparece junto a la fotografía.
6. El área romana cambia a completada.
7. Sus luces se apagan.
8. Se ilumina la entrada de Egipto.

No es necesario agregar el casco como objeto físico al inventario.

El casco queda representado simbólicamente en el panfleto.

El jugador continúa con las mismas dos herramientas.

---

# 11. ÁREA 2 — EGIPTO ANTIGUO

## A. Exhibición del museo

Crear una segunda sala, dedicada a Egipto.

Elementos:

- Sarcófagos.
- Estatuas egipcias.
- Jeroglíficos.
- Esculturas.
- Columnas.
- Artefactos arqueológicos.
- Murales.
- Pequeñas vitrinas.

El artefacto principal es un **escarabajo egipcio**.

Debe ser visible en alguna parte de la exhibición.

El jugador tiene que tomar una fotografía que incluya el escarabajo dentro del encuadre.

La misma lógica fotográfica de Roma debe reutilizarse.

No implementar un sistema independiente para cada época.

Una vez tomada una fotografía válida, la Polaroid se desarrolla y transporta al jugador al mundo egipcio.

## B. Mundo histórico de Egipto

Crear un escenario 3D inspirado en un antiguo complejo ceremonial egipcio.

Elementos:

- Pirámides visibles a la distancia.
- Templos.
- Obeliscos.
- Columnas.
- Jeroglíficos.
- Estatuas monumentales.
- Suelo de arena.
- Habitantes antiguos inmóviles.
- Telas suspendidas.
- Polvo flotando en el aire.

El tiempo está congelado, exactamente como en Roma.

Se permiten animaciones extremadamente lentas en detalles ambientales.

El jugador debe avanzar por un recorrido principalmente lineal hasta descubrir un pequeño altar que contiene el escarabajo.

Si tarda más de 20 segundos, se activa el mismo sistema de ayuda.

Al interactuar con el escarabajo, regresa al museo.

---

# 12. FINALIZACIÓN DEL MVP

Cuando el jugador vuelve de Egipto:

- Se registra la segunda Polaroid en el panfleto.
- Se agrega la ilustración del escarabajo.
- Egipto aparece como completado.
- Sus luces se apagan.
- El mapa muestra dos de las diez áreas completadas.

Las otras ocho áreas permanecen inactivas.

Mostrar una conclusión breve y discreta, por ejemplo:

"2 de 10 épocas descubiertas."

"Tu viaje por la historia apenas comienza."

Permitir que el jugador continúe explorando las zonas accesibles del museo o reinicie la experiencia.

No implementar las ocho épocas restantes en esta primera versión.

---

# 13. DISEÑO DE INTERFAZ

La interfaz debe ser minimalista e inmersiva.

Evitar barras de vida, minimapas tradicionales, inventarios complejos, grandes indicadores flotantes y elementos innecesarios.

Utilizar solamente:

- Un punto central discreto cuando sea necesario.
- Indicaciones contextuales de interacción.
- El encuadre de la cámara fotográfica.
- La representación de la Polaroid.
- El panfleto desplegable.
- Una pantalla de inicio y un menú de pausa sencillos.

Las indicaciones deben desaparecer cuando no sean necesarias.

Los elementos de interfaz deben utilizar la misma identidad gráfica que el resto del videojuego: colores pastel, contornos oscuros, ilustraciones simples y tipografías legibles.

El mapa del panfleto debe ser visualmente atractivo y comprensible.

---

# 14. ARQUITECTURA Y TECNOLOGÍAS

Utilizar:

- Three.js.
- TypeScript.
- Vite.
- HTML/CSS para interfaces superpuestas cuando resulte apropiado.
- JavaScript/TypeScript nativo para la lógica de gameplay.

Evitar motores de videojuegos adicionales y dependencias innecesarias.

Organizar el proyecto de manera modular, evitando colocar toda la lógica en un único archivo.

Separar responsabilidades como:

- Inicialización del motor.
- Renderizado.
- Control del jugador.
- Colisiones.
- Cámara Polaroid.
- Captura de fotografías.
- Sistema de interacciones.
- Gestión del panfleto.
- Gestión del progreso.
- Iluminación.
- Escenarios.
- Transiciones.
- Temporizador y asistencia.
- Audio.

Diseñar una estructura de datos reutilizable para definir cada época histórica.

Por ejemplo, cada época debería tener:

- Identificador.
- Nombre.
- Estado.
- Artefacto requerido.
- Escenario del museo.
- Escenario histórico.
- Posición de aparición.
- Posición del artefacto.
- Ruta de ayuda.
- Información de progreso.

No duplicar innecesariamente el código de Roma y Egipto.

Crear componentes y sistemas reutilizables.

## Rendimiento

El videojuego debe funcionar razonablemente bien en computadoras de escritorio con navegadores modernos.

Priorizar:

- Geometrías optimizadas.
- Materiales compartidos.
- Cantidades moderadas de objetos.
- Gestión correcta de memoria.
- Carga y descarga de escenarios cuando corresponda.
- Animaciones livianas.
- Cantidad moderada de luces y sombras.

Evitar implementar física compleja si un sistema sencillo de colisiones es suficiente.

## Recursos visuales

Para la primera versión, priorizar modelos construidos proceduralmente con geometrías simples de Three.js.

Se pueden utilizar primitivas combinadas, geometrías personalizadas, materiales toon y detalles ilustrados.

No depender de modelos 3D externos pagos.

Si un elemento visual complejo no puede construirse de forma detallada, reemplazarlo por una interpretación simplificada y estilizada que conserve su identidad.

No sacrificar la funcionalidad del juego por intentar conseguir un realismo innecesario.

---

# 15. ESTADOS DEL VIDEOJUEGO

Implementar una máquina de estados o sistema equivalente para controlar la experiencia.

Estados sugeridos:

- `START`
- `MUSEUM_EXTERIOR`
- `GUARD_INTERACTION`
- `MUSEUM_EXPLORATION`
- `EXHIBITION_EXPLORATION`
- `CAMERA_EQUIPPED`
- `PHOTO_DEVELOPING`
- `WORLD_TRANSITION`
- `HISTORICAL_EXPLORATION`
- `ARTIFACT_INTERACTION`
- `RETURN_TO_MUSEUM`
- `GAME_COMPLETED`

Los estados deben controlar qué acciones están permitidas y evitar interacciones incompatibles.

Por ejemplo, no se debe poder caminar libremente mientras la fotografía ocupa toda la pantalla durante una transición.

El progreso y los estados de las áreas deben mantenerse de forma consistente al regresar de cada mundo.

---

# 16. EXPERIENCIA DE USUARIO

Aunque sea un MVP, el videojuego debe sentirse como una experiencia completa.

Cuidar especialmente:

- El momento de recibir el panfleto.
- La primera entrada al museo oscuro.
- El encendido de la sala romana.
- La exploración de las exhibiciones.
- El sonido de la cámara.
- La aparición de la Polaroid.
- El desarrollo gradual de la fotografía.
- La transición a una época histórica.
- La sensación de tiempo congelado.
- El descubrimiento del artefacto.
- El regreso al museo.
- La actualización visual del mapa.
- El encendido de la siguiente sala.

Estos momentos son más importantes que incorporar gran cantidad de elementos decorativos.

El jugador debe entender la mecánica principalmente mediante las interacciones con el mundo, con instrucciones contextuales mínimas.

---

# 17. CRITERIOS DE FUNCIONAMIENTO

El proyecto no se considera terminado si solamente muestra un museo 3D con controles de movimiento.

La primera versión debe permitir completar realmente el siguiente recorrido:

1. Iniciar el juego.
2. Caminar por el exterior del Louvre.
3. Acercarse al guardia e interactuar.
4. Recibir el panfleto.
5. Entrar al museo.
6. Observar cómo se ilumina la sala romana.
7. Caminar hasta la exhibición.
8. Equipar la cámara.
9. Fotografiar una escena que contenga el casco.
10. Observar cómo se desarrolla la Polaroid.
11. Aparecer en el Coliseo.
12. Explorar el entorno congelado.
13. Recibir ayuda visual si pasan 20 segundos.
14. Encontrar e interactuar con el casco.
15. Regresar al museo.
16. Ver Roma marcada como completada en el panfleto.
17. Observar cómo se apaga Roma y se ilumina Egipto.
18. Entrar en la exhibición egipcia.
19. Fotografiar una escena que contenga el escarabajo.
20. Viajar al antiguo Egipto.
21. Explorar el escenario y encontrar el escarabajo.
22. Regresar al museo.
23. Ver ambas épocas registradas en el panfleto.
24. Finalizar la experiencia con dos de las diez áreas completadas.

Cada paso debe ser interactivo y funcional.

No simular el recorrido mediante un video.

---

# 18. METODOLOGÍA DE IMPLEMENTACIÓN

Quiero que desarrolles el proyecto de forma incremental y mantenible.

Priorizar este orden:

**Fase 1 — Base técnica**

Crear la estructura del proyecto, el renderer, la cámara, los controles de primera persona, las colisiones y el estilo visual principal.

**Fase 2 — Museo**

Implementar el exterior del Louvre, el guardia, la entrega del panfleto, el hall y el sistema de iluminación de las áreas.

**Fase 3 — Cámara y fotografía**

Implementar la Polaroid, el encuadre, la validación del artefacto, la captura real del render y el desarrollo de las fotografías.

**Fase 4 — Roma**

Construir la sala romana y el mundo histórico del Coliseo, implementar la transición temporal, la exploración, la asistencia y el regreso.

**Fase 5 — Egipto**

Construir la exhibición egipcia y su mundo histórico, reutilizando los sistemas ya desarrollados.

**Fase 6 — Progreso y presentación**

Finalizar el panfleto, el sistema de áreas, la persistencia de progreso de la partida, el audio, las transiciones y los detalles visuales.

**Fase 7 — Verificación y pulido**

Verificar que el flujo completo pueda jugarse sin errores, que las interacciones funcionen, que las colisiones sean correctas y que el estilo visual sea coherente en todos los escenarios.

No agregar frameworks, abstracciones o sistemas complejos que no aporten valor real al MVP.

---

# 19. RESULTADO ESPERADO

Quiero obtener un proyecto Three.js real, organizado y ejecutable localmente.

Debe incluir:

- Código fuente completo.
- Estructura clara de carpetas.
- Escenarios tridimensionales.
- Estética anime ilustrada con cel-shading.
- Movimiento funcional en primera persona.
- Interacciones.
- Sistema de fotografías Polaroid.
- Transiciones entre escenarios.
- Roma y Egipto jugables.
- Artefactos.
- Sistema de ayuda.
- Panfleto y mapa interactivo.
- Progresión de áreas.
- Pantalla de inicio y conclusión.
- Instrucciones para instalar dependencias y ejecutar el proyecto.

**No quiero únicamente una explicación de cómo construir el juego. Quiero que implementes el código y los archivos necesarios para poder ejecutarlo.**

Si alguna característica resulta demasiado compleja, implementar una versión simplificada pero funcional, conservando la mecánica central y la dirección artística.

Priorizar un MVP pequeño, bien diseñado, visualmente coherente y completamente jugable antes que un proyecto enorme e incompleto.

## PRINCIPIO FUNDAMENTAL

El juego debe sentirse como una ilustración anime tridimensional en la que el jugador puede caminar, tomar fotografías y entrar a momentos históricos congelados en el tiempo.

**La fotografía no es un complemento: es la mecánica central que conecta el museo, la historia y la progresión del jugador.**