# Simulador MoveSpol

Simulador 3D interactivo del sistema de movilidad interna del campus Gustavo
Galindo de la ESPOL. Representa, en un solo entorno, cómo funcionaría el
conteo automático de pasajeros, la información en tiempo real para el
estudiante, la detección por cámara en el andén y la integración con BiciPOL.

Está pensado como **herramienta de presentación**: arranca solo y va contando
la historia por escenarios, sin que quien lo observa tenga que tocar nada.

---

## 1. Qué problema representa

En hora pico el bus interno llega saturado, el estudiante no sabe si podrá
abordar hasta llegar a la parada, y no existe ningún dato real de cuánta gente
espera ni de cuántos pasajeros van a bordo. El simulador muestra cómo cada
pieza del sistema responde a ese problema.

---

## 2. Cómo verlo

> ⚠️ **No lo abras con doble clic.** Como `main.js` es un módulo ES, el
> navegador bloquea su carga bajo el protocolo `file://` y solo verás una
> pantalla en blanco, sin ningún mensaje de error visible.

Usa una de estas dos opciones:

**Opción A — GitHub Pages (recomendada para compartir)**
1. Sube los archivos al repositorio.
2. Ve a *Settings → Pages*.
3. En *Source*, elige la rama `main` y la carpeta raíz (`/root`).
4. Espera ~1 minuto: queda publicado en
   `https://TU-USUARIO.github.io/TU-REPOSITORIO/`

**Opción B — Servidor local (para editar y probar)**
```bash
cd carpeta-del-proyecto
python -m http.server
```
Luego abre `http://localhost:8000` en el navegador.
(En VSCode también sirve la extensión *Live Server*: clic derecho sobre
`index.html` → *Open with Live Server*.)

---

## 3. Qué se ve en pantalla

La ventana se divide en dos zonas:

**Izquierda — Escena 3D.** La parada Garita con el bus Trans-ESPOL, la fila de
estudiantes esperando en el bordillo, la estación BiciPOL, el poste con la
cámara cenital y la pantalla LED del andén. Se puede girar y acercar con el
mouse (arrastrar para rotar, rueda para zoom).

**Derecha — App del estudiante.** El mockup del celular mostrando la
disponibilidad de plazas, el estado del viaje y el mapa de unidades, que se
actualiza en vivo según lo que ocurre en la escena 3D.

**Abajo al centro.** Un subtítulo que narra paso a paso lo que está pasando en
el escenario en reproducción.

---

## 4. Cómo usarlo en una presentación

El simulador **arranca solo** con el escenario 1 a los 1.5 segundos de cargar.
Para mostrar otro caso, haz clic en cualquiera de los botones de la barra
superior. Cada escenario se reproduce completo y va explicándose en el
subtítulo inferior.

### Escenarios incluidos

| # | Escenario | Qué demuestra |
|---|-----------|---------------|
| 1 | Un estudiante sube | Los sensores S1 y S2 detectan la secuencia de entrada y suman +1 al aforo |
| 2 | Llegan 5 estudiantes | Cada persona se cuenta por separado; el filtro de 600 ms evita contar mochilas |
| 3 | El bus se llena | Al llegar a 55 pasajeros (50 sentados + 5 de pie) se despacha automáticamente |
| 4 | Visitante externo (QR) | Persona no reconocida como estudiante: aviso + QR de registro en la pantalla LED |
| 5 | Cámara detecta aglomeración | La fila crece de 4 a 9 personas y el sistema avisa al chofer que debe cerrar |
| 6 | Reserva de bicicleta | Toma una bici en Garita y la deja en Rectorado; ambas estaciones con 5 anclajes |
| 7 | Recorrido Ruta Express | El bus recorre FCNM, FIEC y Rectorado bajando pasajeros, y vuelve vacío a Garita |

### Botones de la barra superior

- **Escenarios 1 a 7**: reproducen cada caso. Al iniciar uno nuevo, el anterior
  se detiene automáticamente.
- **⚙︎ Manual**: despliega los controles manuales (subir/bajar un estudiante,
  llenar lote de 10, cambiar entre escenario Garita y Terminal, y abrir la
  consola de telemetría del operador). Están ocultos por defecto para que la
  presentación se vea limpia.

---

## 5. Qué está implementado por dentro

**Conteo bidireccional real.** Dos sensores ópticos (S1 hacia la calle, S2
hacia el interior) con máquina de estados: la secuencia S1 → ambos → S2 cuenta
una entrada, y la inversa cuenta una salida. Incluye el filtro anti-rebote de
600 ms que evita que una mochila se cuente como persona.

**Aforo con zona de pie.** Capacidad de 55 pasajeros: 50 asientos reales
modelados en 3D más 5 puestos de pie. Cada estudiante que sube camina hasta un
asiento libre y se queda ahí; cuando baja, libera ese cupo.

**Pantalla LED del andén.** Rota entre estado del bus, tipo de ruta y
publicidad ambiental (uso de BiciPOL y reducción de huella de carbono). Cuando
se detecta un visitante, se queda fija en el QR de registro.

**Cámara cenital siempre activa.** Cuenta las personas que esperan en el andén
y usa ese dato para decidir cuándo conviene despachar y qué tipo de ruta
asignar (Express con poca demanda, Completa con mucha).

**Estaciones BiciPOL balanceadas.** Garita y Rectorado con 5 anclajes cada una,
con sensor de disponibilidad por anclaje y letrero que muestra el balance entre
ambas en tiempo real.

---

## 6. Estructura de archivos

```
index.html    Estructura de la interfaz (escena 3D + mockup de la app)
styles.css    Estilos propios (Tailwind se carga por CDN)
main.js       Toda la lógica del simulador
README.md     Este archivo
```

`main.js` está dividido en secciones numeradas con comentarios:

| Sección | Contenido |
|---------|-----------|
| 1 | Inicialización de Three.js (escena, cámara, luces) |
| 2 | Parada Garita y ciclovía |
| 3 | Bicicletas y sensores de anclaje |
| 4 | Poste de cámara cenital |
| 5 | Pantalla LED del andén |
| 6 | Escenario Terminal |
| 7 | Modelo del autobús |
| 8 | Lógica de aforo, pasajeros y eventos |
| 9 | Cinemática y flujo de pasajeros |
| 10 | Motor de escenarios |
| 11 | Ambientación y escenarios avanzados |

---

## 7. Cómo agregar un escenario nuevo

No hay que tocar el HTML: los botones se generan solos desde la lista
`SCENARIOS`. Basta con agregar un objeto en la sección 10 u 11 de `main.js`:

```js
SCENARIOS.push({
    id: 'mi-caso',
    nombre: '8 · Mi caso nuevo',
    pasos: [
        { t: 0,    texto: 'Lo que se lee en el subtítulo.' },
        { t: 1500, texto: 'Siguiente momento.', accion: () => spawnStudent('in') },
        { t: 4000, accion: () => moverCamara(
                       new THREE.Vector3(5, 3, 8),
                       new THREE.Vector3(0, 0, 0), 2500) }
    ]
});
```

- `t` son milisegundos contados desde que arranca el escenario.
- `texto` es opcional: si lo pones, aparece en el subtítulo inferior.
- `accion` es opcional: cualquier función que quieras ejecutar en ese momento.

### Funciones listas para reutilizar

| Función | Qué hace |
|---------|----------|
| `spawnStudent('in')` / `spawnStudent('out')` | Un estudiante sube o baja cruzando los sensores |
| `toggleDoorState()` | Abre o cierra la puerta del bus |
| `moverCamara(pos, target, ms)` | Mueve la cámara suavemente (efecto video) |
| `mostrarSubtitulo(texto)` | Cambia el texto del subtítulo inferior |
| `mostrarAvisoVisitante(true/false, pos)` | Activa el aviso y el QR de visitante |
| `reservarBicicleta()` | Reserva una bici en Garita y la devuelve en Rectorado |
| `ajustarFilaEspera(n)` | Define cuántas personas se ven esperando (0 a 9) |
| `correrRecorridoExpress(mostrarSubtitulo)` | Lanza el recorrido completo con bajadas |
| `removeMesh(mesh)` | Elimina un objeto 3D **liberando memoria de GPU** |

---

## 8. Nota importante para quien edite el código

Al eliminar objetos 3D, usa siempre `removeMesh(mesh)` y **nunca**
`scene.remove(mesh)` directamente. `scene.remove()` saca el objeto de la vista
pero deja su geometría y su material ocupando memoria en la tarjeta gráfica:
si se usa así, el simulador se va poniendo lento a medida que los pasajeros
suben y bajan. `removeMesh()` libera esa memoria antes de quitar el objeto.
