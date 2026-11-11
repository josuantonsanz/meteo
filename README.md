# meteo

Previsión meteorológica estática (sin dependencias ni build) que se puede
instalar como app en el móvil.

- Sitio: https://meteo.glosasdeguardia.es
- GitHub Pages: https://josuantonsanz.github.io/meteo

## Archivos

| Archivo | Contenido |
| --- | --- |
| `index.html` | Estructura: cabecera fija, vistas, lugares, pie |
| `styles.css` | Estilos (claro/oscuro con `prefers-color-scheme`, *safe areas*) |
| `app.js` | Lógica: datos, vistas (día/semana/detalle) y gráficas |
| `sw.js` | Service worker: caché de la app para abrirla sin conexión |
| `manifest.webmanifest` | Manifiesto de instalación (nombre, iconos, colores) |
| `icons/` | Iconos PNG/SVG; `icon.svg` es la fuente vectorial |
| `favicon.ico` | Favicon 16/32/48 |
| `CNAME` | Dominio propio de GitHub Pages |
| `.nojekyll` | Evita que Pages procese el sitio con Jekyll |
| `publicar.bat` | Envía los cambios a GitHub |
| `todo.md` | Ideas y tareas pendientes |

## Instalar en el móvil

- **Android (Chrome)**: menú ⋮ → «Instalar aplicación» (o «Añadir a pantalla de
  inicio»). Se abre a pantalla completa con el icono de la nube.
- **iOS (Safari)**: botón Compartir → «Añadir a pantalla de inicio». El icono
  lo toma de `icons/apple-touch-icon.png`.

## Datos y caché

- Open-Meteo (ECMWF, ICON, ensemble WeatherNext 2), CC BY 4.0
- AEMET OpenData (API key en `app.js`, constante `KEY`)
- Nominatim (OpenStreetMap) para buscar lugares

### Detalles de AEMET (importante si se toca)

- La clave va **en la URL** (`?api_key=…`), nunca en una cabecera `api_key`.
  `opendata.aemet.es` manda `Access-Control-Allow-Origin: *` en el `GET`, pero
  **no** responde al preflight `OPTIONS`; con la clave en cabecera el navegador
  hace preflight y bloquea la petición (`TypeError: Failed to fetch`).
- Todo el JSON viene en **ISO-8859-15**: se lee con `TextDecoder("iso-8859-15")`
  (`L9` / `jaemet()` en `app.js`). Con `response.json()` los nombres salen como
  «Valdegov�a» y la búsqueda de municipios falla.
- Límites: horaria sólo **3 días** (desde la hora actual) y diaria **7 días**.
  No da probabilidad por horas (sólo la diaria, en % máximo) ni mm diarios: los
  mm del día se suman de la horaria cuando el día está completo (≥ 20 horas).
- Si la clave caduca, la API responde 401 y el pie avisa de que hay que
  renovarla. Caducidad actual: feb. 2027 (`exp` del JWT).

- Datos de previsión: `localStorage`, clave `t.cache2.<lugar>`, **30 minutos**
  (`Date.now()-ca.t<18e5`). Pasado ese tiempo se vuelven a pedir; no hay
  recarga automática mientras la página está abierta.
- El «tirar para recargar» del móvil está desactivado (`overscroll-behavior`)
  para que la barra inferior no se mueva al llegar arriba del todo. Para datos
  frescos ya inmediatos: recargar la página desde el navegador.
- Estado (lugar, vista, día): `t.places`, `t.city`, `t.view`, sin caducidad.
- Código (HTML/CSS/JS): el service worker pide primero a la red, así que un
  `push` se ve en la siguiente visita. Sin conexión, sirve su copia.

## Publicar

Doble clic en `publicar.bat` (o `publicar.bat "mensaje del cambio"`): hace
`git add -A`, confirma con mensaje y envía a `origin/main`. GitHub Pages
reconstruye el sitio en ~1 minuto.

A mano:

```bash
git add -A && git commit -m "cambio" && git push origin main
```

Si cambias la lista de archivos del `sw.js`, sube el número de `CACHE`
(`meteo-v2` → `meteo-v3`) para que se refresque la copia guardada.
