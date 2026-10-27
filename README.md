# Norma · Compras Públicas de Chanco

Aplicación Next.js (App Router), React, TypeScript y Tailwind CSS. Asistente en español sobre el PDF original `2583778.pdf`: Decreto N.º 661, publicado el 12 de diciembre de 2024, 50 páginas.

## Ejecutar

Requiere Node.js 22 o superior y acceso a npm y Google Gemini API.

```sh
npm install
npm run dev
```

Abre http://127.0.0.1:3000. Para producción:

```sh
npm run build
npm start
```

En producción coloca un proxy HTTPS frente al servidor. La cookie segura de producción requiere HTTPS. Usa almacenamiento privado persistente para la configuración (ver `NORMA_DATA_DIR` más abajo). Esta versión está diseñada para una instancia Node.js con disco persistente; no para réplicas independientes ni funciones efímeras sin adaptar almacenamiento y límites.

## Administrador y Gemini

En Administración, inicia sesión con `nfigueroa@chanco.cl`. En una instalación nueva debes configurar `ADMIN_PASSWORD_HASH` en el entorno usando el script indicado más abajo; el repositorio no incluye una contraseña predeterminada ni su hash. La instalación local conserva su acceso en `.env.local`, excluido de Git.

Añade la API key de Google AI Studio y el identificador del modelo habilitado en tu proyecto. La licencia de Gemini para Google Workspace no sustituye la clave de Gemini API. El modelo predeterminado es `gemini-2.5-flash`, editable desde el panel. La disponibilidad y cuota dependen del proyecto de Google. La clave se cifra con AES-256-GCM; no se devuelve al cliente. El indicador «Clave guardada» confirma almacenamiento, no conectividad con Google.

Opcionalmente usa `.env.local` basado en `.env.example`. La configuración guardada en el panel prevalece sobre las variables Gemini. Para configurar o cambiar la contraseña, ejecuta `node scripts/password-hash.mjs`, escribe la nueva contraseña en stdin y finaliza la entrada (Ctrl+Z y Enter en Windows). Configura el hash resultante en `ADMIN_PASSWORD_HASH` y reinicia. El script no oculta la entrada; utiliza una terminal privada. No envíes claves por URL o argumentos de comandos.

La llave maestra y la configuración cifrada se guardan en `NORMA_DATA_DIR` si se configura una ruta absoluta. En producción, por defecto se usa `~/.local/share/norma-compras`, fuera del proyecto y de `public_html`; en desarrollo se usa `.runtime/`, excluido de Git. Conserva ambos en una copia de seguridad privada con permisos limitados a la cuenta de servicio. Las sesiones firmadas vencen a las 8 horas. Los límites de consultas e intentos son por proceso; `TRUST_PROXY=true` permite separar visitantes por IP únicamente detrás de un proxy confiable que sobrescriba la cabecera. Sin ese ajuste el límite es compartido.

## Respuestas y fuentes

- Cada consulta envía el texto completo de las 50 páginas a Gemini. No se sube el PDF binario; se utiliza el texto extraído en `data/reglamento.json`.
- Las instrucciones del PDF y del usuario se tratan como datos; no pueden sustituir las reglas del sistema.
- Gemini devuelve una respuesta estructurada con identificadores de fragmentos. El servidor resuelve los identificadores contra un índice determinista y adjunta la página y el texto originales, sin pedir al modelo que transcriba citas. Los fragmentos reconstruyen las 50 páginas sin eliminar palabras. Conserva respuestas con respaldo parcial si todas sus citas son verificables y las identifica como parciales; deben explicar expresamente qué no permite resolver el documento. Si faltan citas o son inválidas, pide una única corrección a Gemini antes de rechazar la respuesta. Este reintento puede aumentar el tiempo y consumo de API. La normalización tolera diferencias tipográficas y guiones de corte de línea, sin aceptar palabras o montos distintos.
- Esta verificación comprueba coincidencia textual, no demuestra por sí sola que cada conclusión de la IA sea correcta. El usuario debe contrastar el contexto y condiciones en el original.
- La fuente es la edición de 2024, sin verificación ni incorporación de modificaciones posteriores. La aplicación no afirma vigencia jurídica actual.
- Para preguntas de seguimiento se incluyen los seis mensajes anteriores (hasta 6.000 caracteres por mensaje), como contexto conversacional y nunca como evidencia normativa.
- El historial se conserva únicamente en el navegador de ese equipo y puede borrarse desde la barra lateral. La aplicación no registra preguntas en el servidor. Google recibe las consultas y el texto fuente conforme a las condiciones del proyecto configurado.
- El PDF original se sirve en `/reglamento.pdf`; las referencias permiten abrir la página correspondiente.

## Comprobaciones

```sh
npm test
npm run typecheck
npm run build
```

Las pruebas verifican la integridad de las 50 páginas, citas literales, páginas incorrectas y rechazo de referencias inventadas. La integración real con Gemini requiere una API key con permisos y cuota; no se simulan respuestas cuando falta la clave.

## Despliegue en compras.chanco.cl

URL objetivo: `https://compras.chanco.cl/`.

Esta instalación utiliza un subdominio dedicado y la raíz `/`, sin `/apps/compras`. La carpeta de trabajo puede ser el directorio de despliegue administrado por el panel, por ejemplo `/var/www/.../deploys/<commit>/`; su ruta física no determina la URL. El clon debe dejar `package.json` directamente en el directorio de trabajo del proceso.

| Ajuste del panel | Valor |
| --- | --- |
| Sitio/dominio | `compras.chanco.cl` |
| Repositorio | `Niikhostyle/compras_publicas` |
| Rama | `main` |
| Compilación | `npm ci --include=dev && npm run build` |
| Proceso persistente | Node.js 22 o 24 LTS |
| Inicio | `npm start` |
| Puerto | 3000 por defecto; Next.js también acepta la variable `PORT` |
| HTTP Proxy | Activado para el sitio dedicado `compras.chanco.cl` |
| Directorio de publicación estática | No se publica `.next/` como carpeta estática |

`NEXT_PUBLIC_BASE_PATH` debe estar vacío o no definido, tanto al compilar como al ejecutar. Si antes se configuró `/apps/compras` en el panel, quita ese valor y recompila. Las APIs, recursos, PDF y cookies utilizan la raíz por defecto.

### Proceso y proxy

El proceso debe ejecutarse desde la carpeta del repositorio ya compilado, por ejemplo `deploys/current` si el panel mantiene allí el enlace a la versión activa. `npm start` ejecuta `next start --hostname 0.0.0.0`, como requiere el proxy del alojamiento. El puerto predeterminado es 3000; si configuras `PORT`, el destino del proxy debe coincidir. Activa HTTP Proxy para todo el sitio dedicado; si el panel indica que el campo de camino vacío representa todo el sitio, deja ese campo vacío. El acceso externo debe pasar por el proxy HTTPS del alojamiento.

El proxy de este sitio dedicado debe reenviar las rutas de `compras.chanco.cl` al puerto del proceso Node.js, conservando la ruta y la cabecera `Host` original para la protección de origen. No cambies el proxy de `intranet.chanco.cl` ni el de sus otras aplicaciones. Configura un timeout de al menos 120 segundos para Gemini.

La compilación por sí sola no inicia Next.js. Comprueba también el log del proceso persistente: debe mostrar `next start` y `Ready`. Después verifica `/` y `/api/status`; este último debe devolver JSON con `configured` y `pages`. Una página genérica `Forbidden` no demuestra un error de permisos de archivos: puede indicar que está atendiendo el servidor estático y no el proxy hacia Node.js. Revisa primero la asociación del proceso al sitio y el proxy, sin aplicar permisos globales ni crear un `index.html`.

### Variables y persistencia

Configura `NODE_ENV=production`, `APP_ORIGIN=https://compras.chanco.cl` y `ADMIN_PASSWORD_HASH` en el entorno privado del proceso. `APP_ORIGIN` permite validar el origen público exacto aunque el proxy sustituya la cabecera Host; no habilita otros dominios, protocolos o puertos. Opcionalmente añade `GEMINI_API_KEY` y `GEMINI_MODEL`; la clave también puede guardarse posteriormente desde Administración. `NORMA_DATA_DIR` permite elegir una carpeta privada absoluta fuera del directorio público y de las carpetas de despliegues versionados, escribible solo por la cuenta del proceso y persistente entre despliegues. Si se omite, se usa `~/.local/share/norma-compras` en producción. Conserva conjuntamente `master.key` y `settings.enc` para recuperar la configuración existente. El archivo privado `runtime.env`, dentro de esa misma carpeta, puede conservar `ADMIN_PASSWORD_HASH` y `APP_ORIGIN` entre despliegues. Las variables definidas por el panel prevalecen. Este archivo nunca debe subirse a GitHub ni al directorio público.

No copies `.env.local` ni claves dentro de una carpeta que el servidor web pueda descargar; usa las variables privadas del panel. Habilita HTTPS para que el navegador envíe la cookie segura. Si habilitas `TRUST_PROXY=true`, el proxy debe sobrescribir `X-Forwarded-For` con la IP real, sin aceptar una cabecera arbitraria del visitante.

Esta versión requiere una instancia Node.js con disco persistente. No es una exportación estática ni está preparada para réplicas con configuraciones independientes.

### Instalación opcional en una subcarpeta

Para otra instalación que necesite una subcarpeta, configura `NEXT_PUBLIC_BASE_PATH=/apps/compras` antes de compilar y conserva el mismo valor al ejecutar. En ese caso el proxy debe cubrir solo ese prefijo y conservarlo al reenviar la ruta. Las cookies también se limitan automáticamente a esa ruta. Este ajuste no corresponde al despliegue dedicado de `compras.chanco.cl`.
