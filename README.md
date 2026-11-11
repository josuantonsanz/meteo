# meteo

Previsión meteorológica estática (sin dependencias ni build).

- Sitio: https://meteo.glosasdeguardia.es
- GitHub Pages: https://josuantonsanz.github.io/meteo

## Archivos

| Archivo | Contenido |
| --- | --- |
| `index.html` | Estructura de la página |
| `styles.css` | Estilos (claro/oscuro con `prefers-color-scheme`) |
| `app.js` | Lógica: carga de datos, vistas (día/semana/detalle), gráficas |
| `CNAME` | Dominio propio de GitHub Pages (`meteo.glosasdeguardia.es`) |
| `.nojekyll` | Evita que Pages procese el sitio con Jekyll |

## Datos

- Open-Meteo (ECMWF, ICON, ensemble WeatherNext 2), CC BY 4.0
- AEMET OpenData (API key en `app.js`; si caduca, hay que renovarla)
- Nominatim (OpenStreetMap) para buscar lugares

Las vistas se guardan en `localStorage` (`t.places`, `t.city`, `t.view`).
Los datos se cachean 18 minutos (`t.cache2.<lugar>`).

## Publicar

Doble clic en `publicar.bat` (o `publicar.bat "mensaje del cambio"`): hace
`git add -A`, confirma con mensaje y envía a `origin/main`. GitHub Pages
reconstruye el sitio en ~1 minuto.

A mano:

```bash
git add -A && git commit -m "cambio" && git push origin main
```
