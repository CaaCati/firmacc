# Firma CC — firma digital del intendente desde el celular

App de una sola pantalla, sin backend, para que el intendente estampe su
firma escaneada (con sello, fondo transparente) sobre cualquier PDF desde
el celular: elige o recibe el PDF, arrastra la firma a la posición que
quiere, y descarga o comparte el documento firmado.

La firma ya está incrustada en `index.html` (como base64), así que el
intendente nunca tiene que buscarla ni seleccionarla.

## Cómo funciona

- **PDF.js** (CDN) dibuja el PDF en un `<canvas>` para que se vea en pantalla.
- **pdf-lib** (CDN) hace el trabajo real: inserta la imagen PNG de la firma
  en las coordenadas exactas donde el intendente la soltó, y genera el PDF
  final. Todo corre en el navegador — el documento nunca sale del celular.
- El tamaño de la firma es fijo (30% del ancho de la página, ver constante
  `STAMP_WIDTH_RATIO` en `index.html`); solo se puede arrastrar, no
  redimensionar, tal como se pidió.

## Deploy (GitHub Pages, como el resto de tus proyectos)

1. Subí estos archivos a un repo (o a una carpeta del repo si ya usás uno
   compartido), manteniendo la estructura tal cual:
   ```
   index.html
   manifest.json
   sw.js
   icon-192.png
   icon-512.png
   ```
2. Activá GitHub Pages sobre esa rama/carpeta. GitHub Pages ya sirve todo
   por HTTPS, que es requisito para que el service worker y el "Compartir"
   funcionen — no hace falta pasar por el VM ni por DuckDNS para esto.
3. Abrí la URL en el celular del intendente con Chrome.

## Instalación en el celular (paso clave)

Para que la app aparezca en el menú "Compartir" de Android cuando le llega
un PDF por WhatsApp o Gmail, **tiene que estar instalada** (no alcanza con
tenerla abierta en una pestaña):

1. Abrir la URL en Chrome.
2. Menú (⋮) → **"Agregar a pantalla de inicio"** / "Instalar app".
3. A partir de ahí, Chrome la registra como una app real (WebAPK) ante
   Android, y va a aparecer en la lista de "Compartir con..." de cualquier
   app que comparta un PDF.

Sin este paso, el botón "Elegir PDF" dentro de la app sigue funcionando
igual — lo único que no aparece es la opción de "Compartir hacia" la app
desde WhatsApp/Gmail.

## Nota técnica: por qué no usé "Abrir con" (file_handlers)

Existe una API (`file_handlers` en el manifest) que asocia una PWA como
manejador de un tipo de archivo, para que aparezca en "Abrir con" al tocar
un PDF descargado. La dejé afuera a propósito: hoy solo funciona en
navegadores de escritorio, no en Android — así que no hubiera servido para
este caso. El camino que sí funciona en el celular es el que implementé:
**Web Share Target** (el botón "Compartir" del sistema).

## Si querés ajustar algo

- **Tamaño de la firma**: constante `STAMP_WIDTH_RATIO` en el `<script>`
  de `index.html` (hoy 0.30 = 30% del ancho de la página).
- **Cambiar la firma**: reemplazar el valor de `SIGNATURE_BASE64` por el
  base64 de un nuevo PNG con fondo transparente.
- **Nombre / colores de la app instalada**: `manifest.json` (`name`,
  `theme_color`, `background_color`) e íconos `icon-192.png` / `icon-512.png`.
