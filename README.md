# Simulador MoveSpol

Simulador 3D del sistema de movilidad interna del campus Gustavo Galindo
(ESPOL): conteo automático de pasajeros, información en tiempo real para el
estudiante, detección por cámara en el andén e integración con BiciPOL.

---

## Estructura

```
index.html    Interfaz (escena 3D + mockup de la app)
styles.css    Estilos propios (Tailwind va por CDN)
main.js       Toda la lógica del simulador
```

`main.js` está dividido en secciones numeradas:

| Sección | Contenido |
|---------|-----------|
| 1 | Inicialización de Three.js |
| 2 | Parada Garita y ciclovía |
| 3 | Bicicletas y sensores de anclaje |
| 4 | Poste de cámara cenital |
| 5 | Pantalla LED del andén |
| 6 | Escenario Terminal |
| 7 | Modelo del autobús |
| 8 | Lógica de aforo, pasajeros y eventos |
| 9 | Cinemática y flujo de pasajeros |
| 10 | Filas por ruta y secuencia Express → Completa |

---

## Qué muestra la escena

**Dos filas separadas por destino**, señalizadas con letreros:

- **Fila 1 · Ruta Express** (verde) — FCNM, FCSH y Básicas. Aparece mucho más
  concurrida: a las 7am la mayoría se dirige a la Zona Oeste, que es el
  trayecto corto.
- **Fila 2 · Ruta Completa** (azul) — FIEC, Rectorado y FADCOM. Con pocos
  pasajeros, ya que FADCOM queda en la Zona Este, al otro lado del lago.

Sobre el bus hay un **cartel de ruta** que indica cuál está operando en ese
momento.

**Secuencia automática**: cuando el aforo llega a 55 pasajeros, el bus cierra
puertas y recorre sus paradas — en cada una bajan estudiantes y el aforo se
descuenta en la app. Al quedar vacío retorna a Garita, y la unidad siguiente
toma la otra ruta: si la que salió era Express, la que llega es Completa (la
que sí llega hasta FADCOM), y viceversa.

---

## Controles

En la barra superior: cambiar entre escenario Garita y Terminal, subir o bajar
un estudiante manualmente, y llenar un lote de 10 para acelerar la demostración.

La **Consola de Operador** y su botón quedan ocultos para despejar la vista.
Si se necesita durante una demostración, se reactiva quitando la clase
`hidden` del botón `btn-toggle-telemetry` en `index.html`.

---

## Notas para quien edite el código

**Anillos de elementos clickeables.** Los círculos de colores que señalaban los
objetos interactivos están desactivados. La función `createPulsingTarget()` y
todas sus llamadas se conservan intactas: para volver a mostrarlos, cambia
`MOSTRAR_ANILLOS` a `true` dentro de esa función.

**Ajustar el tamaño de las filas.** `ajustarFilas(nExpress, nCompleta)` define
cuántas personas se ven en cada fila (máximo 14 y 5 respectivamente).

**Cambiar las paradas de cada ruta.** Edita los arreglos `PARADAS_EXPRESS` y
`PARADAS_COMPLETA` en la sección 10.

**Liberar memoria al eliminar objetos 3D.** `scene.remove()` saca el objeto de
la vista pero deja su geometría y material ocupando memoria en la GPU. Al
eliminar pasajeros, llama antes a `.dispose()` sobre geometría y material
(como hace la bajada de pasajeros en la sección 10); de lo contrario el
simulador se degrada con el uso prolongado.
