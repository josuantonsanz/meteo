# Pendiente

## Hecho

- [x] `manifest.webmanifest` (standalone, `start_url: "./"`, iconos 192/512 con
      `purpose: any maskable`).
- [x] Iconos: `icons/icon-512.png`, `icons/icon-192.png`,
      `icons/apple-touch-icon.png`, `icons/favicon.svg` y `favicon.ico`
      (16/32/48). Fuente vectorial en `icons/icon.svg` (nube blanca con tres
      gotas sobre degradado azul; el contenido cabe en la zona segura de
      Android, así que vale como icono maskable).
- [x] `<head>`: manifiesto, `theme-color` claro/oscuro, metadatos de Apple,
      `viewport-fit=cover` y `color-scheme`.
- [x] Cabecera fija con lugar y fichas de sitio con scroll horizontal; vistas
      como pestañas abajo en móvil (con *safe area*) y segmentado en escritorio.
- [x] Tabla horaria y resumen en tarjetas compactas en móvil; vista Semana con
      una tarjeta por día; Detalle con tabla compacta de seis columnas.
- [x] Gráficas: en pantallas estrechas se generan con un lienzo propio (392 px)
      para que las etiquetas no queden minúsculas.
- [x] Service worker (`sw.js`): HTML/CSS/JS por red primero (sin versiones
      viejas) con respaldo en caché; iconos caché primero. Comprobado sin
      conexión: la vista Día sigue funcionando con los datos guardados.

## Pendiente

- [ ] Probar en un móvil real: Chrome Android («Instalar aplicación») y Safari
      iOS («Añadir a pantalla de inicio»), en claro y en oscuro, y con el móvil
      girado.
- [ ] Lighthouse: confirmar que sale como instalable y que no hay avisos.
- [ ] ¿Cachear también la vista Detalle? Hoy avisa de que necesita conexión
      (`detCache` solo vive en memoria).
- [ ] Repasar contraste de las fuentes tenues de las gráficas en modo oscuro.
- [ ] Si apetece, capturas (`screenshots` en el manifiesto) para que el
      instalador de Android muestre una vista previa más rica.
