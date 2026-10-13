# CLAUDE.md

Guías de comportamiento para reducir errores comunes de codificación con LLM. Combinar con instrucciones específicas del proyecto según sea necesario.

**Compromiso:** Estas guías priorizan la cautela por encima de la velocidad. Para tareas triviales, usar criterio.

## 1. Pensar Antes de Codificar

**No asumir. No ocultar la confusión. Hacer explícitos los compromisos.**

Antes de implementar:
- Explicitar los supuestos. Si hay incertidumbre, preguntar.
- Si existen varias interpretaciones, presentarlas; no elegir una en silencio.
- Si existe un enfoque más simple, decirlo. Cuestionar la dirección cuando corresponda.
- Si algo no está claro, detenerse. Nombrar qué resulta confuso. Preguntar.

## 2. Simplicidad Primero

**El código mínimo que resuelve el problema. Nada especulativo.**

- No agregar funcionalidades más allá de lo pedido.
- No crear abstracciones para código de un solo uso.
- No agregar "flexibilidad" o "configurabilidad" que no fue solicitada.
- No agregar manejo de errores para escenarios imposibles.
- Si se escriben 200 líneas y podrían ser 50, reescribir.

Preguntarse: "¿Un ingeniero senior diría que esto está sobredimensionado?". Si la respuesta es sí, simplificar.

## 3. Cambios Quirúrgicos

**Tocar solo lo necesario. Limpiar solo el propio desorden.**

Al editar código existente:
- No "mejorar" código, comentarios o formato adyacentes.
- No refactorizar cosas que no están rotas.
- Respetar el estilo existente, aunque se haría distinto.
- Si se detecta código muerto no relacionado, mencionarlo; no eliminarlo.

Cuando los cambios generan elementos huérfanos:
- Eliminar imports, variables o funciones que TUS cambios dejaron sin uso.
- No eliminar código muerto preexistente salvo que se solicite.

La prueba: cada línea modificada debería poder rastrearse directamente hasta la solicitud del usuario.

## 4. Ejecución Orientada a Objetivos

**Definir criterios de éxito. Iterar hasta verificar.**

Transformar las tareas en objetivos verificables:
- "Agregar validación" → "Escribir pruebas para entradas inválidas y luego hacer que pasen"
- "Corregir el bug" → "Escribir una prueba que lo reproduzca y luego hacer que pase"
- "Refactorizar X" → "Asegurar que las pruebas pasen antes y después"

Para tareas de varios pasos, declarar un plan breve:
```
1. [Paso] → verificar: [comprobación]
2. [Paso] → verificar: [comprobación]
3. [Paso] → verificar: [comprobación]
```

Los criterios de éxito sólidos permiten iterar de forma independiente. Los criterios débiles ("hacer que funcione") requieren aclaraciones constantes.

---

**Estas guías están funcionando si:** hay menos cambios innecesarios en los diffs, menos reescrituras por sobredimensionamiento y las preguntas aclaratorias aparecen antes de implementar, no después de los errores.
