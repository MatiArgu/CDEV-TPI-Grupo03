# Plan de desarrollo por etapas

## Propósito y alcance

Este documento convierte [Proyecto_general.md](Proyecto_general.md) en entregas pequeñas y verificables. Es un plan de trabajo: **no autoriza a implementar las siete etapas juntas**. Antes de comenzar la siguiente, se revisa el resultado de la anterior, especialmente la dirección visual y la fotografía.

El MVP termina cuando Roma y Egipto se pueden completar de principio a fin en un navegador de escritorio. Las otras ocho épocas figuran en el museo y el panfleto, pero no tienen exhibición terminada ni mundo histórico. La calidad de la imagen ilustrada, la Polaroid y las transiciones tiene prioridad sobre el tamaño de los escenarios.

### Decisiones acordadas

- El museo es ficticio, con exterior inspirado en el Louvre. Esto permite incluir las diez épocas elegidas sin presentar los objetos como piezas reales de sus colecciones.
- Las diez salas tienen un lugar físico. Una sala WIP es un espacio vacío visitable, identificado por nombre y número; todavía no habilita el viaje temporal.
- El orden se cambia en una sola lista de IDs. Cambian con ella la posición física, la numeración, el panfleto y la secuencia de activación. La progresión salta las áreas WIP.
- Orden inicial: Roma, Egipto, Grecia, Babilonia, Edad Media, Renacimiento, Japón feudal, París 1830, Titanic y llegada a la Luna.
- La plataforma objetivo del MVP es escritorio, con teclado, mouse y navegador moderno. No se planifica una versión móvil en estas etapas.

## Las siete entregas

### 1. Motor visual

**Objetivo:** fijar la identidad visual antes de construir escenarios.

**Trabajo:** crear la base Three.js + TypeScript + Vite y una escena de prueba pequeña con arquitectura, vegetación y un objeto de exhibición. Usar geometría low-poly con siluetas irregulares, materiales toon, dos o tres bandas de luz, contornos selectivos, sombras simples y la paleta de la especificación. Preparar una biblioteca pequeña de materiales y formas para reutilizarla.

**Aceptación:** capturas desde distancias corta, media y larga se perciben como un entorno ilustrado y coherente; los objetos importantes se distinguen del fondo; la escena funciona con fluidez en el equipo de desarrollo. Revisar este resultado visual antes de avanzar.

### 2. Movimiento

**Objetivo:** recorrer el prototipo en primera persona.

**Trabajo:** WASD, rotación con mouse y Pointer Lock, altura humana, movimiento de cabeza sutil, colisiones sencillas, interacción contextual con E y pausa/retorno con Escape. No agregar salto, carrera ni tercera persona.

**Aceptación:** se puede recorrer la escena sin atravesar muros u objetos sólidos; el puntero se libera y recupera correctamente; abrir una interfaz o pausar no deja movimiento residual.

### 3. Museo e introducción

**Objetivo:** completar el inicio jugable hasta la llegada al hall.

**Trabajo:** exterior estilizado con fachada, pirámide y entrada; guardia que entrega el panfleto; acceso al hall; señalización e iluminación discreta hacia el futuro sector de Roma. El panfleto debe verse como papel desplegable frente al jugador y mostrar el mapa con las diez áreas, aunque sus salas todavía no estén construidas.

**Aceptación:** iniciar, acercarse al guardia, recibir el panfleto, abrirlo y entrar al museo funciona en una misma sesión. La luz y la arquitectura guían hacia el sector previsto para Roma sin flechas invasivas; todavía no hay viaje jugable.

### 4. Mecánica Polaroid

**Objetivo:** demostrar la mecánica central antes de producir Roma.

**Trabajo:** cámara 3D equipable, encuadre, disparo y sonido, captura real del render, foto que se revela de borrosa a nítida y transición reutilizable. Probarla en una escena temporal pequeña con un artefacto de prueba; esta escena no forma parte del contenido definitivo.

**Aceptación:** la imagen coincide con el encuadre al disparar. El artefacto puede estar en un borde, pero debe ser visible y no estar oculto por un sólido. Una foto inválida también se revela, no activa el viaje y permite reintentar. Revisar el aspecto y el ritmo del revelado antes de construir los mundos históricos.

### 5. Diez áreas WIP

**Objetivo:** preparar el museo completo sin desarrollar ocho mundos prematuramente.

**Trabajo:** construir diez módulos de sala compactos y visitables, con nombres, números y una identidad cromática básica. Instanciar cada área en el módulo que corresponda a la lista de orden. En esta etapa las diez salas siguen vacías e inactivas; el panfleto refleja su posición y estado. Retirar la escena temporal de prueba de la experiencia pública.

**Aceptación:** las diez salas existen y se pueden recorrer. Cambiar la lista de orden mueve físicamente las salas y actualiza la señalización y el panfleto sin editar coordenadas de cada época. Las WIP no activan viajes ni impiden llegar a la siguiente época jugable.

### 6. Roma de principio a fin

**Objetivo:** completar el primer ciclo histórico real.

**Trabajo:** exhibición romana con casco de gladiador fotografiable; mundo acotado inspirado en el Coliseo durante una naumaquia congelada; ruta lineal con puntos de interés, ayuda sutil tras 20 segundos, interacción final, regreso, registro de Polaroid y casco en el panfleto. Compartir la lógica de transición y progreso con las futuras áreas.

**Aceptación:** todo el ciclo funciona sin intervención de desarrollo. Al volver, Roma figura completada y el panfleto muestra 1/10. Como Egipto todavía es WIP en esta entrega, no se anuncia otra época jugable hasta la etapa 7.

### 7. Egipto y cierre del MVP

**Objetivo:** demostrar que el sistema es reutilizable y cerrar una experiencia de dos épocas.

**Trabajo:** exhibición del escarabajo; templo ceremonial egipcio pequeño con recorrido propio; reutilización de foto, validación, transición, ayuda y regreso. Completar audio ambiental, persistencia local, pantalla de inicio y pausa, conclusión discreta y opción de reiniciar partida.

**Aceptación:** un jugador nuevo puede completar Roma y Egipto en secuencia, ver ambas fotos y artefactos en el panfleto y recibir el cierre 2/10. Puede seguir explorando las salas WIP o empezar de nuevo. Recargar el navegador conserva el progreso.

## Verificación transversal

- **Visual:** revisar cada escenario nuevo contra la etapa 1: colores pastel, lectura de siluetas, contornos selectivos y sensación de tiempo detenido. Limitar el tamaño del escenario si hace falta para preservar la calidad.
- **Foto:** probar artefacto centrado, en el borde, fuera del cuadro, parcialmente visible y completamente tapado; comparar cada captura con lo que se veía en el encuadre.
- **Estado:** probar panfleto, cámara, pausa y transiciones en distintos órdenes para impedir acciones incompatibles o controles bloqueados.
- **Progreso:** completar Roma y Egipto, recargar y reiniciar. Mover temporalmente Egipto al puesto 8: debe cambiar de sala y número, conservar sus datos por ID y seguir activándose después de Roma porque las áreas intermedias son WIP.
- **Recorrido:** probar las siete entregas en el navegador, además de ejecutar las comprobaciones de compilación y tipos disponibles en cada etapa.

Cada entrega se cierra con una demostración del recorrido correspondiente, una revisión de sus criterios y una lista breve de pendientes. Los problemas que rompan el flujo de esa entrega se corrigen antes de iniciar la siguiente.
