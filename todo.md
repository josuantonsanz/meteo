# Pendiente

## 1. Diseño tipo aplicación + «pseudo instalación» como acceso directo

Objetivo: que en el móvil se sienta como una app y se pueda instalar como icono
en la pantalla de inicio, sin tiendas, sin frameworks y sin paso de compilación.
Requisito ya cumplido: HTTPS en `meteo.glosasdeguardia.es`.

### Manifiesto e iconos

- [ ] `manifest.webmanifest` con `name`, `short_name` («Meteo»), `start_url: "./"`,
      `scope: "./"`, `display: "standalone"`, `orientation: "portrait"`,
      `background_color`, `theme_color` e iconos 192 y 512.
- [ ] `<link rel="manifest" href="manifest.webmanifest">` en `index.html`.
- [ ] Iconos: `icon-192.png`, `icon-512.png` y `apple-touch-icon.png` (180×180).
      Diseño a decidir (¿nube + rayo con el azul `--acc`?). Sin transparencia en
      el de Apple: iOS rellena con negro.
- [ ] `<head>`: `theme-color` (claro y oscuro con `media="(prefers-color-scheme: dark)"`),
      `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`,
      `apple-mobile-web-app-title`, y `viewport` con `viewport-fit=cover`.

### Interfaz de app

- [ ] Barra superior fija (sticky) con el lugar actual y el selector de lugar,
      en vez del `h1` + nav que scrollea con la página.
- [ ] Navegación entre vistas (Día / Semana / Detalle) como *segmented control*
      o pestañas inferiores, fijas y alcanzables con el pulgar.
- [ ] Respetar *safe areas* iOS: `padding: env(safe-area-inset-top/bottom/left/right)`
      en `main` y en la barra inferior.
- [ ] Tablas en pantalla estrecha: la tabla horaria hoy scrollea en horizontal.
      Valorar tarjetas o vista compacta (hora · icono · temperatura · prob. lluvia)
      con las fuentes como filas cortas.
- [ ] Objetivos táctiles de 44 px y sin `hover` como único estado.
- [ ] Girar el móvil o cambiar de lugar sin saltos de scroll.

### Opcional: offline

- [ ] Decidir si merece un *service worker* mínimo (cachea `index.html`,
      `styles.css`, `app.js`, iconos; red primero para los datos).
      Android instala solo con el manifiesto; iOS funciona igual con
      «Añadir a pantalla de inicio», pero sin caché no hay arranque offline.

### Verificación

- [ ] Probar en Android (Chrome: «Instalar aplicación») y en iOS (Safari:
      «Añadir a pantalla de inicio»), en claro y en oscuro.
- [ ] Lighthouse: comprobar que sale como instalable y que el tema no rompe.
- [ ] Actualizar `publicar.bat`/README si se añaden archivos nuevos.
