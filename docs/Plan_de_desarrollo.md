# Plan de desarrollo por etapas

## Propósito y alcance

Este documento convierte [Proyecto_general.md](Proyecto_general.md) en entregas pequeñas y verificables. Es un plan de trabajo: **no autoriza a implementar las siete etapas juntas**. Antes de comenzar la siguiente, se revisa el resultado de la anterior, especialmente la dirección visual y la fotografía.

El MVP termina cuando Roma y Egipto se pueden completar de principio a fin en un navegador de escritorio. El museo tiene cinco épocas. Egipto y Roma tienen sus viajes completos. Medieval, Japón Feudal y Luna se pueden recorrer como salas en preparación; sus viajes requieren entregas posteriores. La calidad de la imagen ilustrada, la Polaroid y las transiciones tiene prioridad sobre el tamaño de los escenarios.

### Decisiones acordadas

- El museo es ficticio, con exterior inspirado en el Louvre. Esto permite incluir las cinco épocas elegidas sin presentar los objetos como piezas reales de sus colecciones.
- Cinco salas físicas: dos en el ala izquierda, una galería medieval transversal al fondo y dos de regreso por la derecha. Todas las puertas se abren con E; las WIP son visitables sin viajes.
- `areaOrder` determina posición, número, señalización, panfleto y prioridad entre viajes disponibles. El acceso físico no depende del progreso.
- Orden: Antiguo Egipto, Antigua Roma, Época Medieval, Japón Feudal y Llegada a la Luna.
- Panfleto y fotografías son objetos 3D sostenidos con las manos. Abrir el papel libera el cursor; M o clic reanudan. Mantener solo avisos contextuales, encuadre y pausa como UI de pantalla.
- La plataforma objetivo del MVP es escritorio, con teclado, mouse y navegador moderno. No se planifica una versión móvil en estas etapas.

## Las siete entregas

### 1. Motor visual

**Objetivo:** fijar la identidad visual antes de construir escenarios.

**Trabajo:** crear la base Three.js + TypeScript + Vite y una escena de prueba pequeña con arquitectura, vegetación y un objeto de exhibición. Usar geometría low-poly con siluetas irregulares, materiales toon, dos o tres bandas de luz, contornos selectivos, sombras simples y la paleta de la especificación. Preparar una biblioteca pequeña de materiales y formas para reutilizarla.

**Aceptación:** capturas desde distancias corta, media y larga se perciben como un entorno ilustrado y coherente; los objetos importantes se distinguen del fondo; la escena funciona con fluidez en el equipo de desarrollo. Revisar este resultado visual antes de avanzar.

### 2. Movimiento

**Objetivo:** recorrer el prototipo en primera persona.

**Trabajo:** WASD, rotación con mouse y Pointer Lock, altura humana, movimiento de cabeza sutil, colisiones sencillas, interacción contextual con E y pausa/retorno con Escape. No agregar salto ni tercera persona. La carrera con Shift se incorporó por pedido posterior al comenzar la etapa 6.

**Aceptación:** se puede recorrer la escena sin atravesar muros u objetos sólidos; el puntero se libera y recupera correctamente; abrir una interfaz o pausar no deja movimiento residual.

### 3. Museo e introducción

**Objetivo:** completar el inicio jugable hasta la llegada al hall.

**Trabajo:** exterior estilizado con fachada, pirámide y entrada; guardia que entrega el panfleto; acceso al hall; señalización e iluminación discreta hacia el futuro sector de Roma. El panfleto debe verse como papel desplegable frente al jugador y mostrar el mapa con las cinco áreas, aunque sus salas todavía no estén construidas.

**Aceptación:** iniciar, acercarse al guardia, recibir el panfleto, abrirlo y entrar al museo funciona en una misma sesión. La luz y la arquitectura guían hacia el sector previsto para Roma sin flechas invasivas; todavía no hay viaje jugable.

### 4. Mecánica Polaroid

**Objetivo:** demostrar la mecánica central antes de producir Roma.

**Trabajo:** cámara 3D equipable, encuadre, disparo y sonido, captura real del render, foto expulsada que aparece gradualmente en el papel sostenido y transición reutilizable. Probarla en una escena temporal pequeña con un artefacto de prueba; esta escena no forma parte del contenido definitivo.

**Aceptación:** la imagen coincide con el encuadre al disparar. El artefacto puede estar en un borde, pero debe ser visible y no estar oculto por un sólido. Una foto inválida también se revela, no activa el viaje y permite reintentar. Revisar el aspecto y el ritmo del revelado antes de construir los mundos históricos.

### 5. Circuito de cinco salas (alcance revisado)

**Objetivo:** organizar el museo completo sin anticipar mundos históricos.

**Trabajo:** dos salas longitudinales a cada lado y una galería transversal al fondo, con materiales y alturas compartidos. Las épocas WIP tienen iluminación, número y señalización de viaje en preparación; se pueden atravesar.

**Aceptación:** recorrer Egipto → Roma → Medieval → Japón → Luna → hall. Mantener Roma en 10,8 × 16. El mapa físico coincide con la planta. Cambiar `areaOrder` mueve las identidades, números y textos. Las WIP no activan viajes.

### 6. Roma de principio a fin

**Objetivo:** completar el primer ciclo histórico real.

**Trabajo:** exhibición romana con casco de gladiador fotografiable; mundo acotado inspirado en el Coliseo durante una naumaquia congelada; ruta lineal con puntos de interés, ayuda sutil tras 20 segundos, interacción final, regreso, registro de Polaroid y casco en el panfleto. Compartir la lógica de transición y progreso con las futuras áreas.

**Aceptación:** todo el ciclo funciona sin intervención de desarrollo. Al volver, Roma figura completada y el panfleto físico muestra 1/5 y conserva la foto y el casco recuperado. Se puede seguir recorriendo el museo.

### 7. Egipto y cierre del MVP — implementada

**Objetivo:** demostrar que el sistema es reutilizable y cerrar una experiencia de dos épocas.

**Trabajo:** exhibición del escarabajo; templo ceremonial egipcio pequeño con recorrido propio; reutilización de foto, validación, transición, ayuda y regreso. Mantener el efecto de disparo sin viento ambiental continuo, persistencia local, pantalla de inicio y pausa, conclusión discreta y opción de reiniciar partida.

**Aceptación:** un jugador nuevo puede completar Egipto y Roma en secuencia, ver ambas fotos y artefactos en el panfleto y recibir el cierre 2/5. Puede volver al hall por las puertas abiertas o empezar de nuevo; las otras tres salas siguen visitables sin viajes. Recargar el navegador conserva el progreso.

## Verificación transversal

- **Visual:** revisar cada escenario nuevo contra la etapa 1: colores pastel, lectura de siluetas, contornos selectivos y sensación de tiempo detenido. Limitar el tamaño del escenario si hace falta para preservar la calidad.
- **Foto:** probar artefacto centrado, en el borde, fuera del cuadro, parcialmente visible y completamente tapado; comparar cada captura con lo que se veía en el encuadre.
- **Estado:** probar panfleto, cámara, pausa y transiciones en distintos órdenes para impedir acciones incompatibles o controles bloqueados.
- **Progreso:** completar Egipto y Roma, comprobar ambos recuerdos y 2/5, recargar y reiniciar. Intercambiar Egipto y Luna debe mover la sala y su número y conservar los datos por ID.
- **Recorrido:** probar las siete entregas en el navegador, además de ejecutar las comprobaciones de compilación y tipos disponibles en cada etapa.

Cada entrega se cierra con una demostración del recorrido correspondiente, una revisión de sus criterios y una lista breve de pendientes. Los problemas que rompan el flujo de esa entrega se corrigen antes de iniciar la siguiente.
