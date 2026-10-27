import type { NextConfig } from 'next';
import { basePath } from './lib/paths';
const config: NextConfig = { basePath, poweredByHeader: false, async headers() { return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'same-origin'},{key:'X-Frame-Options',value:'SAMEORIGIN'}]}]; } };
export default config;
