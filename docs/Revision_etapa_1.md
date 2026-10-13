# Revisión de la etapa 1 — motor visual

La escena de prueba usa Three.js, TypeScript y Vite. Combina fachada clásica ficticia, dos árboles, jardineras y un casco sobre pedestal. No representa todavía una sala definitiva ni habilita viaje temporal.

## Capturas de inspección

| Distancia | Captura | Punto a revisar |
| --- | --- | --- |
| Lejos | [Ver imagen](capturas/etapa-1-far.png) | Composición, siluetas y paleta general. |
| Medio | [Ver imagen](capturas/etapa-1-mid.png) | Separación entre arquitectura, vegetación y exhibición. |
| Cerca | [Ver imagen](capturas/etapa-1-near.png) | Forma del casco, tres bandas de luz y contornos selectivos. |

La biblioteca en `src/visual.ts` comparte paleta, materiales toon, bloques, coronas irregulares y contornos. La escena usa una luz ambiental, una direccional con sombra simple y manchas planas de sombra. El render está limitado a 1,75 veces la densidad de píxeles del dispositivo.

## Dirección visual revisada

La revisión tomó como guía las dos imágenes aportadas por el equipo: cielo turquesa, superficies crema y verde en masas planas, siluetas entintadas y pequeñas líneas irregulares en la arquitectura. La cámara de inspección bajó hacia una altura más próxima a la de una persona y el suelo dejó de verse como una maqueta circular. La interfaz de inspección usa fichas claras con bordes oscuros para acompañar esa dirección.

## Aceptación y pendientes

- **Aspecto ilustrado:** las tres capturas muestran geometría low-poly irregular, colores pastel más planos, contornos oscuros y lectura separada de la pieza principal. El papel granulado es una capa liviana de CSS.
- **Revisión en navegador:** se abrió la escena en Chrome sin interfaz a 1440 × 900 y se generaron las tres capturas desde la escena real. También se verificó que el botón «Cerca» mueve la cámara y actualiza el estado del selector. La comprobación de tipos y la compilación se ejecutan con los comandos del README.
- **Fluidez en el equipo de desarrollo:** pendiente de confirmar en un navegador con aceleración gráfica real; las capturas automatizadas usaron renderizado por software. La aprobación de la dirección visual también queda para la revisión del equipo antes de iniciar la etapa 2.
