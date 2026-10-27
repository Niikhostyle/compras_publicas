# Norma · Compras Públicas de Chanco

Aplicación Next.js (App Router), React, TypeScript y Tailwind CSS. Asistente en español sobre el PDF original `2583778.pdf`: Decreto N.º 661, publicado el 12 de diciembre de 2024, 50 páginas.

## Ejecutar

Requiere Node.js 22 o superior y acceso a npm y Google Gemini API.

```sh
npm install
npm run dev
```

Abre http://127.0.0.1:3000/apps/compras. Para producción:

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
- Gemini devuelve respuesta estructurada con página y cita literal. El servidor comprueba que cada cita exista en esa página. Conserva respuestas con respaldo parcial si todas sus citas son verificables y las identifica como parciales; deben explicar expresamente qué no permite resolver el documento. Si faltan citas o son inválidas, pide una única corrección a Gemini antes de rechazar la respuesta. Este reintento puede aumentar el tiempo y consumo de API. La normalización tolera diferencias tipográficas y guiones de corte de línea, sin aceptar palabras o montos distintos.
- Esta verificación comprueba coincidencia textual, no demuestra por sí sola que cada conclusión de la IA sea correcta. El usuario debe contrastar el contexto y condiciones en el original.
- La fuente es la edición de 2024, sin verificación ni incorporación de modificaciones posteriores. La aplicación no afirma vigencia jurídica actual.
- Para preguntas de seguimiento se incluyen los seis mensajes anteriores (hasta 6.000 caracteres por mensaje), como contexto conversacional y nunca como evidencia normativa.
- El historial se conserva únicamente en el navegador de ese equipo y puede borrarse desde la barra lateral. La aplicación no registra preguntas en el servidor. Google recibe las consultas y el texto fuente conforme a las condiciones del proyecto configurado.
- El PDF original se sirve en `/apps/compras/reglamento.pdf`; las referencias permiten abrir la página correspondiente.

## Comprobaciones

```sh
npm test
npm run typecheck
npm run build
```

Las pruebas verifican la integridad de las 50 páginas, citas literales, páginas incorrectas y rechazo de referencias inventadas. La integración real con Gemini requiere una API key con permisos y cuota; no se simulan respuestas cuando falta la clave.

## Despliegue en la intranet de Chanco

URL objetivo: `https://intranet.chanco.cl/apps/compras`.
Carpeta del repositorio: `public_html/apps/compras` dentro del sitio de la intranet. El clon debe dejar `package.json` directamente en esa carpeta, sin un nivel adicional `compras_publicas/`.

| Ajuste del panel | Valor |
| --- | --- |
| Repositorio | `Niikhostyle/compras_publicas` |
| Rama | `main` |
| Directorio de trabajo/despliegue | La ruta absoluta del servidor que termina en `public_html/apps/compras` |
| Compilación | `npm ci --include=dev && npm run build` |
| Proceso persistente | Node.js 22 o 24 LTS |
| Inicio | `npm start` |
| Puerto | 3000 por defecto; Next.js también acepta la variable `PORT` |
| Directorio de publicación estática | No se utiliza una exportación estática ni se publica `.next/` como sitio |

El proceso debe ejecutarse desde esa carpeta y el proxy debe dirigirse al puerto del proceso Node.js. `next start` escucha en `127.0.0.1`; el proxy debe poder acceder a esa interfaz en el mismo servidor o espacio de red. Si el panel ejecuta proxy y Node.js en contenedores separados, se debe adaptar el enlace y destino de red a ese entorno.

`basePath` está configurado en `lib/paths.ts` como `/apps/compras`. Las APIs, los archivos JavaScript/CSS y el PDF usan ese prefijo; las cookies de sesión también se limitan a esa ruta. Cambiarlo exige recompilar.

### Proxy de la subcarpeta

La intranet contiene otras aplicaciones: no redirigir todo el dominio a este proceso. Configura exclusivamente `/apps/compras` y sus rutas hijas hacia `http://127.0.0.1:3000`, conservando el prefijo completo. Por ejemplo, `/apps/compras/api/status` debe llegar a Node.js con la misma ruta, sin quitar `/apps/compras`. Conserva además la cabecera `Host` original para la protección de origen. Configura un timeout de al menos 120 segundos para las consultas a Gemini.

El interruptor del panel que indica que reenviará todo el dominio principal no basta para este despliegue compartido: verifica que admita un proxy por ubicación o pide esa regla al administrador del servidor. Copiar archivos en la carpeta pública por sí solo no inicia Next.js.

### Variables y persistencia

Configura `NODE_ENV=production` y `ADMIN_PASSWORD_HASH` en el entorno privado del proceso. Opcionalmente añade `GEMINI_API_KEY` y `GEMINI_MODEL`; la clave también puede guardarse posteriormente desde Administración. `NORMA_DATA_DIR` permite elegir una carpeta privada absoluta fuera de `public_html`, escribible solo por la cuenta del proceso y persistente entre despliegues. Si se omite, se usa `~/.local/share/norma-compras` en producción. Conserva conjuntamente `master.key` y `settings.enc` para recuperar la configuración existente.

No copies `.env.local` ni claves dentro de una carpeta que el servidor web pueda descargar; usa las variables privadas del panel. Habilita HTTPS para que el navegador envíe la cookie segura. Si habilitas `TRUST_PROXY=true`, el proxy debe sobrescribir `X-Forwarded-For` con la IP real, sin aceptar una cabecera arbitraria del visitante.

Esta versión requiere una instancia Node.js con disco persistente. No es una exportación estática ni está preparada para réplicas con configuraciones independientes.
