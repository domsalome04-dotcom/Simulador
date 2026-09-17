# Simulador MoveSpol

Simulador 3D del sistema de movilidad interna de ESPOL: sensores de conteo,
aforo en tiempo real, pantallas LED, cámaras de detección y app del estudiante.

## Estructura

```
index.html    Estructura de la interfaz (escena 3D + mockup de la app)
styles.css    Estilos propios (Tailwind se carga por CDN)
main.js       Toda la lógica: escena Three.js, sensores, app y escenarios
```

## Cómo verlo

⚠️ **No lo abras con doble clic.** Como `main.js` es un módulo ES, el navegador
bloquea su carga bajo el protocolo `file://` y verás la pantalla en blanco.

Opciones válidas:

- **GitHub Pages**: Settings → Pages → rama `main`. Queda en
  `https://usuario.github.io/repositorio/`
- **Local**: en la carpeta del proyecto, `python -m http.server` y abre
  `http://localhost:8000`, o usa la extensión *Live Server* de VSCode.

## Cómo agregar un escenario nuevo

En `main.js`, sección 10, agrega un objeto a la lista `SCENARIOS`:

```js
{
    id: 'mi-caso',
    nombre: '4 · Mi caso nuevo',
    pasos: [
        { t: 0,    texto: 'Lo que se lee en el subtítulo.' },
        { t: 1500, texto: 'Otro momento.', accion: () => spawnStudent('in') }
    ]
}
```

- `t` son milisegundos desde que arranca el escenario.
- `accion` es cualquier función; puedes reutilizar las existentes
  (`spawnStudent`, `toggleDoorState`, etc.) o escribir una nueva.
- El botón aparece solo en la barra superior: no hay que tocar el HTML.

## Escenarios incluidos

| # | Escenario | Qué muestra |
|---|-----------|-------------|
| 1 | Un estudiante sube | Detección S1→S2 y suma al aforo |
| 2 | Llegan 5 estudiantes | Conteo individual con filtro anti-mochila |
| 3 | El bus se llena | Aforo 55 y despacho automático |
| 4 | Visitante externo (QR) | Aviso + QR de registro en la pantalla LED |
| 5 | Cámara detecta aglomeración | Fila creciente → aviso al chofer de cerrar |
| 6 | Reserva de bicicleta | Toma en Garita, deja en Rectorado (5 anclajes c/u) |
| 7 | Recorrido Ruta Express | Viaje con bajadas por parada y retorno vacío |

Todos se reproducen solos: el simulador arranca con el escenario 1 a los 1.5 s.
