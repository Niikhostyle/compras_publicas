import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Norma · Compras Públicas | Chanco',description:'Asistente de consulta del Reglamento de Compras Públicas. Decreto N.º 661 de 2024.'};
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="es"><body>{children}</body></html>; }
