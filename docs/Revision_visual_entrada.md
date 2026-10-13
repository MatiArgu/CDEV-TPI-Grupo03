# Revisión visual del acceso al museo

Esta revisión vuelve sobre la llegada del jugador al museo, ya implementada en la etapa 3. La referencia visual aportada para el acceso se tradujo a la estética ilustrada del juego: piedra cálida, perspectiva profunda, tragaluz, molinetes y un guardia de uniforme azul. El patio, el panfleto y el orden de las salas conservan su función.

## Modelos para inspeccionar

| Vista | Captura | Qué observar |
| --- | --- | --- |
| Acceso completo | [Ver modelo](capturas/entrada-modelo-general.png) | Pórtico abierto, guardia a la derecha y hall visible desde el patio. |
| Guardia | [Ver modelo](capturas/entrada-modelo-guardia.png) | Silueta delgada, camisa azul sencilla, escudos y cinturón utilitario en la escena del museo. |
| Entrega del panfleto | [Ver pose](capturas/entrada-modelo-entrega.png) | Brazo extendido hacia el visitante y panfleto visible. |
| Molinetes cerrados | [Ver modelo](capturas/entrada-modelo-molinetes.png) | Cuatro cuerpos, tres pasos y hojas transparentes. |
| Paso central abierto | [Ver modelo](capturas/entrada-modelo-paso-abierto.png) | Apertura de las dos hojas centrales tras recibir el panfleto. |
| Interior | [Ver modelo](capturas/entrada-modelo-hall.png) | Ritmo de arcos, techo vidriado y sombras sobre el suelo. |

Las capturas se tomaron en Chrome desde cámaras de inspección colocadas a la altura de los ojos. El entorno usa geometría y materiales de Three.js en `src/museum.ts`; el guardia se modela en `src/guard.ts`. El mármol usa vetas dibujadas en un canvas, sin fotografías externas.

## Cambios y comprobaciones

- La puerta maciza fue reemplazada por un pórtico visible desde el patio. Los molinetes mantienen cerrado el acceso hasta la interacción con el guardia; entonces se abren las hojas centrales y se elimina su bloqueo de colisión.
- El guardia recibió un cuerpo de secciones facetadas con hombros estrechos, torso y brazos delgados, piernas largas y rostro anguloso. La nueva referencia se refleja en la camisa azul lisa, los escudos de la gorra y del pecho y el cinturón utilitario. Los brazos, codos, cabeza y torso conservan una jerarquía sencilla para la respiración, la mirada y la entrega del panfleto.
- El hall recibió arcos repetidos, tragaluz curvo, sombra proyectada y suelo claro con vetas suaves. El primer tramo del techo se retranqueó para que no sobresalga de la fachada.
- Se corrigieron las uniones de la fachada: la pared y las bases de las columnas apoyan en el suelo; los capiteles exteriores llegan a la cornisa y los interiores al techo lateral. Las capturas de esta revisión muestran la geometría corregida.
- En Chrome se comprobó que **E** entrega el panfleto y abre los molinetes. Las vistas antes y después muestran el paso central despejado. Queda pendiente una caminata manual completa desde el patio hasta el hall en un equipo con aceleración gráfica: Chrome sin GPU disponible se cerró durante la pasada automatizada larga.

Comparar estas vistas con las [capturas de la etapa 3](Revision_etapa_3.md#capturas-de-inspección) antes de ampliar el detalle de otros espacios.
