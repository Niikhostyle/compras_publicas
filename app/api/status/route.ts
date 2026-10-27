import {NextResponse} from 'next/server';
import {readSettings} from '@/lib/security';
export const runtime='nodejs';
export async function GET(){return NextResponse.json({configured:!!readSettings().apiKey,pages:50},{headers:{'Cache-Control':'no-store'}});}
