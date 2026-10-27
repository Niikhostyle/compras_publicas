// Prefijo compartido por Next.js, los enlaces públicos y las llamadas a la API.
export const basePath = '/apps/compras';
export function appUrl(resource: string) {
  if (!resource.startsWith('/') || resource.startsWith('//')) {
    throw new Error('La ruta debe ser interna y comenzar con /');
  }
  return `${basePath}${resource}`;
}
