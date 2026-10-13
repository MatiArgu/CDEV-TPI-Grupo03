# Ejemplos

Ejemplos de código reales que demuestran los cuatro principios. Cada ejemplo muestra qué suelen hacer mal las LLM y cómo corregirlo.

---

## 1. Pensar Antes de Codificar

### Ejemplo 1: Supuestos Ocultos

**Solicitud del usuario:** "Agregar una funcionalidad para exportar datos de usuarios"

**❌ Qué Hacen las LLM (Supuestos Incorrectos)**

```python
def export_users(format="json"):
    """Exporta todos los usuarios a un archivo."""
    users = User.query.all()

    if format == "json":
        with open("users.json", "w") as f:
            json.dump([u.to_dict() for u in users], f)
    elif format == "csv":
        with open("users.csv", "w") as f:
            writer = csv.DictWriter(f, fieldnames=["id", "email", "name"])
            writer.writeheader()
            writer.writerows([u.to_dict() for u in users])

    return f"Exportados {len(users)} usuarios"
```

**Problemas:**
- Asumió que debía exportar TODOS los usuarios (¿qué pasa con paginación o privacidad?)
- Asumió la ubicación del archivo sin preguntar
- Asumió qué campos incluir
- Asumió los nombres de campos del CSV sin revisar la estructura real de datos

**✅ Qué Debería Pasar (Explicitar Supuestos)**

```
Antes de implementar, necesito aclarar:

1. **Alcance**: ¿Exportar todos los usuarios o un subconjunto filtrado? (implicancias de privacidad)
2. **Formato**: Mencionaste "exportar"; ¿te referís a:
   - Descargar un archivo en el navegador?
   - Una tarea en segundo plano con notificación por email?
   - Un endpoint de API que devuelva datos?
3. **Campos**: ¿Qué campos de usuario? (algunos podrían ser sensibles)
4. **Volumen**: ¿Cuántos usuarios hay normalmente? (afecta el enfoque)

Enfoque más simple: agregar un endpoint de API que devuelva JSON paginado.
Necesitaría más información para exportaciones basadas en archivos.

¿Qué preferís?
```

### Ejemplo 2: Múltiples Interpretaciones

**Solicitud del usuario:** "Hacé que la búsqueda sea más rápida"

**❌ Qué Hacen las LLM (Eligen en Silencio)**

```python
# Agrega caché, índices de base de datos y procesamiento async
# sin preguntar qué significa "más rápida"
@lru_cache(maxsize=1000)
async def search(query: str) -> List[Result]:
    # ... 200 líneas de código de optimización
```

**✅ Qué Debería Pasar**

```
"Hacer la búsqueda más rápida" podría significar:

1. **Menor tiempo de respuesta** (< 100 ms en vez de 500 ms)
   - Agregar índices de base de datos
   - Cachear consultas frecuentes
   - Esfuerzo estimado: 2 horas

2. **Soportar más búsquedas concurrentes** (throughput)
   - Agregar async/await
   - Pooling de conexiones
   - Esfuerzo estimado: 4 horas

3. **Mayor velocidad percibida** (UX)
   - Mostrar resultados parciales inmediatamente
   - Carga progresiva
   - Esfuerzo estimado: 3 horas

La búsqueda actual tarda ~500 ms para consultas típicas.
¿Qué aspecto importa más para tu caso de uso?
```

---

## 2. Simplicidad Primero

### Ejemplo 1: Sobrecarga de Abstracciones

**Solicitud del usuario:** "Agregar una función para calcular descuento"

**❌ Qué Hacen las LLM (Sobrediseñado)**

```python
from abc import ABC, abstractmethod
from enum import Enum
from typing import Protocol, Union
from dataclasses import dataclass


class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, amount: float) -> float:
        pass


class PercentageDiscount(DiscountStrategy):
    def __init__(self, percentage: float):
        self.percentage = percentage

    def calculate(self, amount: float) -> float:
        return amount * (self.percentage / 100)


class FixedDiscount(DiscountStrategy):
    def __init__(self, fixed_amount: float):
        self.fixed_amount = fixed_amount

    def calculate(self, amount: float) -> float:
        return min(self.fixed_amount, amount)


@dataclass
class DiscountConfig:
    strategy: DiscountStrategy
    min_purchase: float = 0.0
    max_discount: float = float("inf")


class DiscountCalculator:
    def __init__(self, config: DiscountConfig):
        self.config = config

    def apply_discount(self, amount: float) -> float:
        if amount < self.config.min_purchase:
            return 0
        discount = self.config.strategy.calculate(amount)
        return min(discount, self.config.max_discount)


# El uso requiere más de 30 líneas de preparación para un cálculo simple
```

**✅ Qué Debería Pasar (Simple)**

```python
def calculate_discount(amount: float, percent: float) -> float:
    """Calcula el monto de descuento. percent debe estar entre 0 y 100."""
    return amount * (percent / 100)


# Uso
discount = calculate_discount(100.0, 10.0)  # $10 de descuento
```

**Cuándo agregar complejidad:** Solo cuando realmente se necesiten múltiples tipos de descuento. Si ese requisito aparece después, refactorizar en ese momento.

### Ejemplo 2: Funcionalidades Especulativas

**Solicitud del usuario:** "Guardar preferencias de usuario en la base de datos"

**❌ Qué Hacen las LLM (Funcionalidades Innecesarias)**

```python
class PreferenceManager:
    def __init__(self, db, cache=None, validator=None):
        self.db = db
        self.cache = cache or InMemoryCache()
        self.validator = validator or DefaultValidator()

    def save(
        self,
        user_id: int,
        prefs: dict,
        merge: bool = True,
        validate: bool = True,
        notify: bool = False,
    ) -> bool:
        """Guarda preferencias con merge, validación y notificaciones opcionales."""

        if validate:
            errors = self.validator.validate(prefs)
            if errors:
                raise ValidationError(errors)

        existing = self.get(user_id) if merge else {}

        if merge:
            existing.update(prefs)
            prefs = existing

        self.db.execute(
            "UPDATE users SET preferences = ? WHERE id = ?",
            (json.dumps(prefs), user_id),
        )

        if self.cache:
            self.cache.set(f"prefs:{user_id}", prefs)

        if notify:
            self.notify_preference_change(user_id, prefs)

        return True

    def notify_preference_change(self, user_id: int, prefs: dict):
        # Otras 30 líneas para una funcionalidad que nadie pidió
        pass
```

**✅ Qué Debería Pasar (Solo lo Pedido)**

```python
def save_preferences(db, user_id: int, preferences: dict):
    """Guarda preferencias de usuario en la base de datos."""
    db.execute(
        "UPDATE users SET preferences = ? WHERE id = ?",
        (json.dumps(preferences), user_id),
    )
```

**Agregar después si hace falta:** Caché (cuando importe el rendimiento), validación (cuando aparezcan datos inválidos), merge (cuando surja el requisito).

---

## 3. Cambios Quirúrgicos

### Ejemplo 1: Refactorización Oportunista

**Solicitud del usuario:** "Corregir el bug donde los emails vacíos rompen el validador"

**❌ Qué Hacen las LLM (Demasiado)**

```diff
  def validate_user(user_data):
-     # Revisar formato de email
-     if not user_data.get('email'):
+     """Valida datos de usuario."""
+     email = user_data.get('email', '').strip()
+     
+     # Validar email
+     if not email:
          raise ValueError("Email requerido")
-     
-     # Validación básica de email
-     if '@' not in user_data['email']:
+     if '@' not in email or '.' not in email.split('@')[1]:
          raise ValueError("Email inválido")
      
-     # Revisar username
-     if not user_data.get('username'):
+     # Validar username
+     username = user_data.get('username', '').strip()
+     if not username:
          raise ValueError("Username requerido")
+     if len(username) < 3:
+         raise ValueError("Username demasiado corto")
+     if not username.isalnum():
+         raise ValueError("Username debe ser alfanumérico")
      
      return True
```

**Problemas:**
- "Mejoró" la validación de email más allá del bug
- Agregó validación de username que nadie pidió
- Cambió comentarios
- Agregó docstring

**✅ Qué Debería Pasar (Quirúrgico)**

```diff
  def validate_user(user_data):
      # Revisar formato de email
-     if not user_data.get('email'):
+     email = user_data.get('email', '')
+     if not email or not email.strip():
          raise ValueError("Email requerido")
      
      # Validación básica de email
-     if '@' not in user_data['email']:
+     if '@' not in email:
          raise ValueError("Email inválido")
      
      # Revisar username
      if not user_data.get('username'):
          raise ValueError("Username requerido")
      
      return True
```

**Solo cambió:** Las líneas específicas que corrigen el manejo de emails vacíos.

### Ejemplo 2: Deriva de Estilo

**Solicitud del usuario:** "Agregar logging a la función de upload"

**❌ Qué Hacen las LLM (Reformatean Todo)**

```diff
- def upload_file(file_path, destination):
+ def upload_file(file_path: str, destination: str) -> bool:
+     """Sube archivo a destino con logging."""
+     logger.info(f"Subiendo {file_path} a {destination}")
+     
      try:
-         with open(file_path, 'rb') as f:
-             data = f.read()
-         
-         response = requests.post(destination, files={'file': data})
-         
-         if response.status_code == 200:
-             return True
-         else:
-             return False
+         with open(file_path, "rb") as f:
+             data = f.read()
+         response = requests.post(destination, files={"file": data})
+         success = response.status_code == 200
+         
+         if success:
+             logger.info(f"Upload exitoso: {file_path}")
+         else:
+             logger.error(f"Upload fallido: {file_path}, status={response.status_code}")
+         
+         return success
      except Exception as e:
-         print(f"Error: {e}")
+         logger.exception(f"Error de upload para {file_path}: {e}")
          return False
```

**Problemas:**
- Cambió el estilo de comillas ('' a "")
- Agregó type hints que nadie pidió
- Agregó docstring
- Reformateó espacios en blanco
- Cambió la lógica de retorno booleano

**✅ Qué Debería Pasar (Respetar el Estilo Existente)**

```diff
+ import logging
+ 
+ logger = logging.getLogger(__name__)
+ 
  def upload_file(file_path, destination):
+     logger.info(f'Iniciando upload: {file_path}')
      try:
          with open(file_path, 'rb') as f:
              data = f.read()
          
          response = requests.post(destination, files={'file': data})
          
          if response.status_code == 200:
+             logger.info(f'Upload exitoso: {file_path}')
              return True
          else:
+             logger.error(f'Upload fallido: {file_path}, status={response.status_code}')
              return False
      except Exception as e:
-         print(f"Error: {e}")
+         logger.exception(f'Error de upload: {file_path}')
          return False
```

**Respetó:** Comillas simples, sin type hints, patrón booleano existente y estilo de espaciado.

---

## 4. Ejecución Orientada a Objetivos

### Ejemplo 1: Vago vs. Verificable

**Solicitud del usuario:** "Arreglar el sistema de autenticación"

**❌ Qué Hacen las LLM (Enfoque Vago)**

```
Voy a corregir el sistema de autenticación:
1. Revisando el código
2. Identificando problemas
3. Haciendo mejoras
4. Probando los cambios

[Continúa haciendo cambios sin criterios claros de éxito]
```

**✅ Qué Debería Pasar (Objetivos Verificables)**

```
Para "arreglar autenticación", necesito definir criterios de éxito.
¿Qué problema específico estamos resolviendo?

Si el problema es "los usuarios quedan logueados después de cambiar la contraseña":

Plan:
1. Escribir prueba: Cambiar contraseña → verificar que la sesión anterior se invalide
   Verificar: La prueba falla (reproduce el bug)

2. Implementar: Invalidar sesiones al cambiar contraseña
   Verificar: La prueba pasa

3. Revisar casos borde: múltiples sesiones activas, cambios concurrentes
   Verificar: Pruebas adicionales pasan

4. Verificar que no haya regresiones: las pruebas existentes de auth siguen pasando
   Verificar: Suite completa en verde

Cobertura actual de pruebas para auth: [muestra cobertura]
¿Cuál es el problema específico de auth que estás viendo?
```

### Ejemplo 2: Varios Pasos con Verificación

**Solicitud del usuario:** "Agregar rate limiting a la API"

**❌ Qué Hacen las LLM (Todo de Una Vez)**

```python
# Implementa rate limiting completo con Redis, múltiples estrategias,
# sistema de configuración y monitoreo en un commit de 300 líneas
# Sin pasos claros de verificación
```

**✅ Qué Debería Pasar (Incremental con Verificación)**

```
Plan para rate limiting:

1. Agregar rate limiting básico en memoria (un solo endpoint)
   Verificar:
   - Prueba: 100 requests → las primeras 10 responden OK, el resto recibe 429
   - Manual: hacer curl al endpoint 11 veces y ver el error de rate limit

2. Extraer a middleware (aplicar a todos los endpoints)
   Verificar:
   - Prueba: Los rate limits aplican a /users y /posts
   - Las pruebas existentes de endpoints siguen pasando

3. Agregar backend Redis (para múltiples servidores)
   Verificar:
   - Prueba: El rate limit persiste tras reiniciar la app
   - Prueba: Dos instancias de la app comparten el contador de rate limit

4. Agregar configuración (tasas por endpoint)
   Verificar:
   - Prueba: /search permite 10/min, /users permite 100/min
   - El archivo de configuración se parsea correctamente

Cada paso es verificable y desplegable de forma independiente.
¿Empezamos por el paso 1?
```

### Ejemplo 3: Verificación con Prueba Primero

**Solicitud del usuario:** "El ordenamiento falla cuando hay puntajes duplicados"

**❌ Qué Hacen las LLM (Corrigen sin Reproducir)**

```python
# Cambia inmediatamente la lógica de ordenamiento sin confirmar el bug
def sort_scores(scores):
    return sorted(scores, key=lambda x: (-x["score"], x["name"]))
```

**✅ Qué Debería Pasar (Reproducir Primero)**

```python
# 1. Primero, escribir una prueba que reproduzca el problema
def test_sort_with_duplicate_scores():
    """Prueba el ordenamiento cuando varios elementos tienen el mismo puntaje."""
    scores = [
        {"name": "Alice", "score": 100},
        {"name": "Bob", "score": 100},
        {"name": "Charlie", "score": 90},
    ]

    result = sort_scores(scores)

    # El bug: el orden no es determinístico para duplicados
    # Ejecutar esta prueba varias veces; debería ser consistente
    assert result[0]["score"] == 100
    assert result[1]["score"] == 100
    assert result[2]["score"] == 90


# Verificar: Ejecutar la prueba 10 veces → falla con ordenamiento inconsistente


# 2. Ahora corregir con un ordenamiento estable
def sort_scores(scores):
    """Ordena por puntaje descendente y luego por nombre ascendente en empates."""
    return sorted(scores, key=lambda x: (-x["score"], x["name"]))


# Verificar: La prueba pasa de forma consistente
```

---

## Resumen de Antipatrones

| Principio | Antipatrón | Corrección |
|-----------|------------|------------|
| Pensar Antes de Codificar | Asume en silencio formato de archivo, campos y alcance | Listar supuestos explícitamente y pedir aclaración |
| Simplicidad Primero | Patrón Strategy para un único cálculo de descuento | Una función hasta que la complejidad sea realmente necesaria |
| Cambios Quirúrgicos | Reformatea comillas y agrega type hints mientras corrige un bug | Cambiar solo las líneas que corrigen el problema reportado |
| Orientado a Objetivos | "Voy a revisar y mejorar el código" | "Escribir prueba para bug X → hacerla pasar → verificar que no haya regresiones" |

## Idea Clave

Los ejemplos "sobredimensionados" no son obviamente incorrectos: usan patrones de diseño y buenas prácticas. El problema es el **momento**: agregan complejidad antes de que sea necesaria, lo que:

- Hace que el código sea más difícil de entender
- Introduce más bugs
- Toma más tiempo de implementar
- Es más difícil de probar

Las versiones "simples":
- Son más fáciles de entender
- Son más rápidas de implementar
- Son más fáciles de probar
- Pueden refactorizarse después, cuando la complejidad sea realmente necesaria
