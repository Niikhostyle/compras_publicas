// Prefijo compartido por Next.js, los enlaces públicos y las llamadas a la API.
export function normalizeBasePath(value: string) {
  if (!value || value === '/') return '';
  const normalized = value.replace(/\/+$/, '');
  if (!/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(normalized)) {
    throw new Error('NEXT_PUBLIC_BASE_PATH debe ser vacío o una ruta como /apps/compras');
  }
  return normalized;
}
// compras.chanco.cl utiliza la raíz. Las instalaciones en subcarpetas son opcionales.
export const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || '');
export const sessionPath = basePath || '/';
export function appUrl(resource: string) {
  if (!resource.startsWith('/') || resource.startsWith('//')) {
    throw new Error('La ruta debe ser interna y comenzar con /');
  }
  return `${basePath}${resource}`;
}
