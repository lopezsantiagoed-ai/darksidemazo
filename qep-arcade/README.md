# QEP ARCADE

Beat 'em up arcade en HTML5 Canvas, sin dependencias. Pixel art dibujado 100% por código.

## Cómo jugar

La forma más simple: abrí **`QEP-Arcade.html`** (el juego entero en un solo archivo) con doble click. También anda `index.html`, pero solo si el ZIP está descomprimido, porque necesita la carpeta `js/`. En celular aparecen controles táctiles.

Después de cambiar algo en `js/`, regenerá el archivo único con `python3 build.py`.

| | Jugador 1 | Jugador 2 |
|---|---|---|
| Moverse | Flechas | W A S D |
| Golpe (combo x3) | Z | F |
| Salto (golpe en el aire = patada) | X | G |
| Especial (gasta un poco de vida) | C | H |
| Pausa | Enter | |

- **F** suma al jugador 2 en los mapas co-op; **2** (o el botón `+2P CPU` en celular) lo suma manejado por la CPU.
- **M** activa o silencia el sonido.

## Dificultad

En la pantalla de selección, **↑ / ↓** (o tocar la dificultad en el celular) elige entre **FÁCIL**, **NORMAL**, **DIFÍCIL** y **PESADILLA QEP**. Cambia la vida y el daño de enemigos y jefes, su agresividad, cuántos te rodean, enemigos extra por oleada, las vidas y cuánto cura la comida. Las más difíciles dan más bonus de puntos.

## Personajes y mapas

| Pibe | Mapa | 2P | Jefe |
|---|---|---|---|
| Juani (Boca) | La Boca: Caminito, la Bombonera y el almacén El Genovés con Fran de cameo | — | Super Iacobellis |
| Juani (nivel 2) | La Boca de noche: Riachuelo, Puente Transbordador y la Bombonera iluminada | — | Macri |
| Nico (River bordó) | Tokio: Shibuya, Shinjuku, Skytree, neones → Estadio Sanfrecce en Hiroshima | Santi (aparece en el puesto CASEUS) | Sanfreche-San |
| Nico (nivel 2) | Barrio River: Aeroparque, Belgrano con banderas, KIPER PDTE y VAMOS TRILLO → Monumental | Santi | Yayo Cozza Di Carlo |
| Santi (River) | Amsterdam: canales, humo, gente extrovertida → portal al Obelisco | — | Blackri |
| Santi (nivel 2) | Centro porteño: San Telmo, Monserrat, London City, Gaumont, El Imparcial → Casa Rosada | Nico (entra contra el jefe) | El Peluca |
| Fran (Banfield) | Banfield: casas inglesas, farolas, adoquines, Florencio Solá | Martín (el hincha del Rojo, entra como CPU contra el jefe) | Chiqui TAP |
| Fran (nivel 2) | Lanús de noche: estación del Roca, Pizzería Las Palmas, La Fortaleza, calles rotas e hinchas granates | Martín | Padrino Nicola |

## Sponsor: CASEUS

En todos los mapas hay un puesto de **CASEUS · Quesos & Fiambres**. Ana, con la de Vélez, te regala una picada que recarga toda la vida.

## Estructura

- `js/core.js`: input (teclado/táctil), audio sintetizado (efectos y música chiptune)
- `js/art.js`: sprites de personajes, comida, objetos y proyectiles
- `js/levels.js`: looks de los pibes, fondos de cada mapa, oleadas y jefes
- `js/game.js`: motor (combate, IA, jefes, cámara, HUD, menús)
