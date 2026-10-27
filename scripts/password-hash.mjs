import {randomBytes,scryptSync} from 'node:crypto';
// Lee desde stdin: no pases contraseñas como argumentos del proceso.
let value='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',chunk=>value+=chunk);
process.stdin.on('end',()=>{const password=value.trimEnd();if(password.length<12){console.error('Usa al menos 12 caracteres.');process.exitCode=1;return;}const salt=randomBytes(16).toString('hex');console.log(salt+':'+scryptSync(password,salt,64).toString('hex'));});
