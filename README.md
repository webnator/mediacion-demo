# Entre — Astro + Pages CMS

POC de una web de mediación corporativa. Marca, logo y textos ficticios. Incluye landing responsive, listado filtrable y páginas de artículos, enlaces, vídeo y podcast. Tres publicaciones visibles y un borrador.

## Arrancar

Node 22.19+ (recomendado Node 24 LTS) y npm.

```sh
npm ci
npm run dev
```

- Web: http://127.0.0.1:4321
- Taller local: http://127.0.0.1:4321/__taller
- Compilar: `npm run build`
- Servir compilación: `npm run preview`
- Pruebas de contenido: `npm test` (después de compilar)
- Prueba del flujo de edición: `npm run test:browser` con el servidor local encendido. Instala Chromium con `npx playwright install chromium` si hace falta. No edites contenido mientras corre: modifica temporalmente dos archivos y los restaura.

Astro 7 ejecuta el servidor de desarrollo en segundo plano. Para detenerlo: `npx astro dev stop`; para ver su estado: `npx astro dev status`.

## Lo importante: Pages CMS no es un editor de carpetas locales

Pages CMS lee y escribe en un repositorio GitHub. Su instalación local también necesita GitHub y configuración propia de autenticación. Esta POC no instala el servidor de Pages CMS.

El **taller local** es una utilidad pequeña y exclusiva de desarrollo para probar el modelo de contenido sin autenticarte. Usa los campos de `.pages.yml` y guarda los mismos JSON que editará Pages CMS. No es una réplica de su interfaz ni tiene todas sus funciones: el cuerpo se edita en Markdown; las imágenes se añaden en `public/media` y se referencian por ruta. Las listas de servicios/pasos se editan, pero no se añaden elementos desde el taller. Pages CMS aporta su propio editor enriquecido, subida de imágenes y listas.

El taller permite editar la portada, cambiar visibilidad, crear publicaciones y activar/desactivar Publicado. Solo acepta peticiones locales a `127.0.0.1`, valida los documentos y no se incluye en `dist`. No es un CMS para producción.

## Prueba rápida (5 minutos)

1. Abre la web y el taller en pestañas distintas.
2. Cambia el titular principal y guarda. Recarga la web para verlo.
3. Desactiva **Mostrar actualidad en portada y menú**. Desaparecen el bloque y el enlace; los artículos conservan sus URLs.
4. Abre **Borrador · Una idea que todavía estamos trabajando** y activa **Publicado**. Aparece en actualidad y se genera su página.
5. Crea una publicación. Para enlace/vídeo/podcast rellena la URL; para artículo basta el texto. Se crea como borrador por defecto.
6. Para retirar un artículo desactiva Publicado: se elimina de la siguiente compilación pública. No basta ocultar la sección de actualidad.

## Archivos que vas a tocar

| Archivo | Para qué sirve |
|---|---|
| `src/data/site.json` | Textos, servicios, pasos, contacto y visibilidad de la landing |
| `src/content/posts/*.json` | Publicaciones; `published: false` excluye la página pública |
| `.pages.yml` | Campos y colecciones del panel real de Pages CMS |
| `src/lib/schema.ts` | Validación de contenido en desarrollo y compilación |
| `src/pages/index.astro` | Estructura de la landing |
| `src/styles/global.css` | Diseño responsive y tokens |
| `public/media/` | Imágenes y geometrías de ejemplo |
| `tools/` | Taller local, nunca desplegado |

Para añadir un campo: actualiza `.pages.yml`, el esquema, el JSON y la plantilla. La estructura visual permanece en código.

## Conectar Pages CMS real

1. El repositorio debe estar en GitHub (puede ser privado).
2. Entra en https://app.pagescms.org con la cuenta **webnator**.
3. Autoriza la aplicación de GitHub **solo para este repositorio** cuando lo solicite.
4. Selecciona `webnator/mediacion-demo`, rama `main`.
5. Pages CMS leerá `.pages.yml`: verás Página principal y Publicaciones.
6. Edita y guarda. Esto crea un commit en GitHub; para verlo en tu copia local ejecuta `git pull --ff-only` y recarga la web. No lo verás en local automáticamente.

Si has editado localmente, guarda y sube primero tus cambios; no edites el mismo archivo simultáneamente en ambos sitios. Si `git pull --ff-only` se detiene por cambios locales o divergencia, resuelve esos cambios sin forzar ni sobrescribir trabajo.

Documentación: https://pagescms.org/docs/ · https://pagescms.org/docs/configuration/collaborators/

La configuración está preparada; el inicio de sesión, autorización de GitHub y la primera edición en el servicio real requieren una prueba con tu cuenta. No se presupone que ya esté conectado.

## Publicar más adelante en Cloudflare Pages

No se ha creado un alojamiento público en esta entrega.

- Conectar el repositorio y rama `main`.
- Comando: `npm run build`.
- Directorio de salida: `dist`.
- Variable `NODE_VERSION`: `24`.
- Variable `PUBLIC_SITE_URL`: URL definitiva con `https://`.
- Tras conectar Pages CMS, cada commit a `main` dispara la reconstrucción. Los cambios no son instantáneos.

Antes de un lanzamiento real: sustituir marca y contenido, configurar dominio/contacto real, revisar textos legales, retirar el `noindex,nofollow` de `src/layouts/Layout.astro` y el `Disallow: /` de `public/robots.txt`, añadir la URL del sitemap a robots.txt y revisar metadatos sociales. Ahora se mantiene noindex deliberadamente.

## Límites de la POC

- Sin formulario ni envío de correo. `contactEnabled` está apagado y el correo `.example` es ficticio.
- YouTube y Spotify (episodios/programas) se incrustan solo al pulsar **Cargar reproductor**. Otras URLs se muestran como enlaces. No se acepta HTML de iframe arbitrario.
- Publicar significa `published: true`; la fecha ordena las entradas y **no programa** su publicación.
- Fuentes servidas localmente. No hay analítica ni solicitudes a reproductores antes del clic.
- Los JSON y las imágenes se guardan en Git. No subas vídeos pesados; enlaza al proveedor.
- El contenido Markdown se sanea antes de renderizarlo.
- Al cambiar un slug cambia su URL; en una web real añade una redirección si la URL anterior ya estaba publicada.
- Las fuentes usan sus licencias OFL distribuidas en los paquetes de Fontsource.
