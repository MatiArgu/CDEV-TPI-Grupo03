# Verificación

## Comprobaciones básicas

```sh
npm run typecheck
npm run build
git diff --check
```

Para revisar una escena modificada, abrir `npm run dev` en Chrome/Chromium y recorrerla con los controles del [README](../README.md). El modo de inspección visual se abre con `?view=far`, `?view=mid` o `?view=near`.

## Recorrido automatizado

Requiere Node.js 22+ (WebSocket global), dependencias instaladas y Chrome/Chromium con depuración remota. Usar **un perfil exclusivo de QA**: `qa:e2e` borra y reinicia la partida de ese perfil.

```sh
# Terminal 1
npm run dev -- --host 127.0.0.1 --port 5174

# Terminal 2: ajustar el ejecutable de Chrome a la instalación local
google-chrome-stable --headless=new --remote-debugging-port=9240 \
  --user-data-dir=/tmp/museo-qa-browser about:blank

# Terminal 3: ejecutar una prueba por vez
npm run qa:e2e
npm run qa:scenes
node scripts/qa/performance.mjs review
```

`GAME_URL` cambia la URL de Vite, `CDP_URL` la del puerto de depuración y `QA_OUTPUT` el directorio de capturas del recorrido. Los scripts usan herramientas de inspección inyectadas en la respuesta de desarrollo; no forman parte del build de producción. La medición de rendimiento en SwiftShader sirve para comparar llamadas de render, no para prometer FPS en una GPU real.

## Casos que deben seguir funcionando

1. Recorrer patio, hall y las cinco salas; fotografiar un artefacto, completar cada mundo y regresar. La foto inválida se revela sin iniciar viaje.
2. Aceptar un objeto visible en un extremo del encuadre y rechazarlo si está totalmente ocluido, fuera de cuadro o invisible. Ignorar obstáculos visualmente ocultos.
3. Mostrar ayuda tras 20 segundos solo si falta recuperar el objeto; mantenerla sobre una ruta transitable.
4. Abrir el panfleto y liberar cursor; pausar durante puertas, revelado, transición y ascenso lunar sin avanzar esos procesos.
5. Recargar con fotos completadas y conservarlas por ID; reordenar Egipto y Luna en `areaOrder` y comprobar que sala, letrero, panfleto y guardado sigan asociados al ID. Reiniciar solo la partida del juego.
6. Comprobar límites transitables, techos desde abajo y liberación/recreación de escenas tras cada regreso.

El [barrido del 13 de octubre de 2026](historico/Revision_end_to_end.md) registra los resultados y capturas de la última revisión. Es evidencia de esa versión, no una garantía automática para cambios futuros.
