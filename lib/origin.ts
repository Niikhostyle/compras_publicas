export function isAllowedOrigin(request: Request, configuredOrigin = '') {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const source = new URL(origin);
    if (!['http:', 'https:'].includes(source.protocol) || source.origin !== origin) return false;
    if (configuredOrigin) {
      const expected = new URL(configuredOrigin);
      return ['http:', 'https:'].includes(expected.protocol) && source.origin === expected.origin;
    }
    const target = new URL(request.url);
    return source.host === (request.headers.get('host') || target.host);
  } catch { return false; }
}
