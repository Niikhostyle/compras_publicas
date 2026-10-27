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

En producción coloca un proxy HTTPS frente al servidor. La cookie segura de producción requiere HTTPS. Usa un volumen persistente privado para `.runtime/`. Esta versión está diseñada para una instancia Node.js con disco persistente; no para réplicas independientes ni funciones efímeras sin adaptar almacenamiento y límites.

## Administrador y Gemini

En Administración, inicia sesión con `nfigueroa@chanco.cl`. En una instalación nueva debes configurar `ADMIN_PASSWORD_HASH` en el entorno usando el script indicado más abajo; el repositorio no incluye una contraseña predeterminada ni su hash. La instalación local conserva su acceso en `.env.local`, excluido de Git.

Añade la API key de Google AI Studio y el identificador del modelo habilitado en tu proyecto. La licencia de Gemini para Google Workspace no sustituye la clave de Gemini API. El modelo predeterminado es `gemini-2.5-flash`, editable desde el panel. La disponibilidad y cuota dependen del proyecto de Google. La clave se cifra con AES-256-GCM; no se devuelve al cliente. El indicador «Clave guardada» confirma almacenamiento, no conectividad con Google.

Opcionalmente usa `.env.local` basado en `.env.example`. La configuración guardada en el panel prevalece sobre las variables Gemini. Para configurar o cambiar la contraseña, ejecuta `node scripts/password-hash.mjs`, escribe la nueva contraseña en stdin y finaliza la entrada (Ctrl+Z y Enter en Windows). Configura el hash resultante en `ADMIN_PASSWORD_HASH` y reinicia. El script no oculta la entrada; utiliza una terminal privada. No envíes claves por URL o argumentos de comandos.

El directorio `.runtime/`, excluido de Git, contiene la llave maestra y la configuración cifrada. Conserva ambos en una copia de seguridad privada con permisos limitados a la cuenta de servicio. Las sesiones firmadas vencen a las 8 horas. Los límites de consultas e intentos son por proceso; `TRUST_PROXY=true` permite separar visitantes por IP únicamente detrás de un proxy confiable que sobrescriba la cabecera. Sin ese ajuste el límite es compartido.

## Respuestas y fuentes

- Cada consulta envía el texto completo de las 50 páginas a Gemini. No se sube el PDF binario; se utiliza el texto extraído en `data/reglamento.json`.
- Las instrucciones del PDF y del usuario se tratan como datos; no pueden sustituir las reglas del sistema.
- Gemini devuelve respuesta estructurada con página y cita literal. El servidor comprueba que cada cita exista en esa página. Conserva respuestas con respaldo parcial si todas sus citas son verificables y las identifica como parciales; deben explicar expresamente qué no permite resolver el documento. Si faltan citas o son inválidas, pide una única corrección a Gemini antes de rechazar la respuesta. Este reintento puede aumentar el tiempo y consumo de API. La normalización tolera diferencias tipográficas y guiones de corte de línea, sin aceptar palabras o montos distintos.
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

## Despliegue

Despliega en un servidor compatible con Next.js y Node.js, con HTTPS y volumen persistente para `.runtime/`. No exportes como sitio estático: la autenticación y las llamadas a Gemini necesitan el servidor. El alojamiento Sites disponible en esta sesión utiliza Workers/Vinext; se conserva Next.js conforme a la petición del usuario y no se sustituye por otro framework.
