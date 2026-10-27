import {NextResponse} from 'next/server';
import {adminEmail,verifyPassword,signSession,isAdmin,rateLimit,sameOrigin,clientId} from '@/lib/security';
export const runtime='nodejs';
export async function GET(){return NextResponse.json({authenticated:await isAdmin()},{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'Origen no permitido'},{status:403});
  if(!rateLimit('login:'+clientId(request),6,15*60_000))return NextResponse.json({error:'Demasiados intentos. Intenta en 15 minutos.'},{status:429});
  try {const {email,password}=await request.json();if(typeof password!=='string'||password.length>256||email!==adminEmail||!verifyPassword(password))return NextResponse.json({error:'Correo o contraseña incorrectos.'},{status:401});const response=NextResponse.json({ok:true});response.cookies.set('norma_session',signSession(),{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:28800});return response;}catch{return NextResponse.json({error:'Solicitud inválida.'},{status:400});}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Origen no permitido'},{status:403});const response=NextResponse.json({ok:true});response.cookies.set('norma_session','',{httpOnly:true,path:'/',maxAge:0});return response;}
