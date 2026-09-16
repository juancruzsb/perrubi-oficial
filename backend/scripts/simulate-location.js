// scripts/simulate-location.js
//
// Sustituto de la app del paseador, que todavía no existe en el frontend
// (ver UBICACION-TIEMPO-REAL.md, "qué queda explícitamente afuera"). Sin
// esto no hay forma de ver el feature de ubicación en tiempo real andar de
// punta a punta: hace login como un Walker, y cada `--interval-ms` manda un
// PATCH /walks/:id/location con una coordenada que avanza un poco cada vez
// (simula caminar), tal como haría watchPositionAsync en la app real.
//
// Uso:
//   node scripts/simulate-location.js --walk-id 11 --email pedro.walker@test.com --password 123456
//
// Flags opcionales:
//   --base-url        default http://localhost:3000
//   --interval-ms      default 5000
//   --start-lat/--start-lng   default una esquina de CABA (Galván 3124)
//
// Requiere que el walk ya esté en estado 'accepted' o 'in_progress' y que
// el walker logueado sea walk.walkerId (si no, el PATCH devuelve 403/409 y
// el script corta con ese mensaje).

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

const BASE_URL = args['base-url'] || process.env.BASE_URL || 'http://localhost:3000';
const WALK_ID = args['walk-id'];
const EMAIL = args.email;
const PASSWORD = args.password;
const INTERVAL_MS = Number(args['interval-ms'] || 5000);
let latitude = Number(args['start-lat'] || -34.5667227);
let longitude = Number(args['start-lng'] || -58.4877776);

if (!WALK_ID || !EMAIL || !PASSWORD) {
  console.error('Uso: node scripts/simulate-location.js --walk-id <id> --email <walker@test.com> --password <pass>');
  process.exit(1);
}

async function login() {
  const res = await fetch(`${BASE_URL}/auth/walkerLogin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login falló (${res.status}): ${data.error || JSON.stringify(data)}`);
  }
  return data.token;
}

// Un paso pequeño y aleatorio, del orden de una cuadra caminada cada tick —
// suficiente para ver al pin moverse en el mapa sin salir del barrio.
function step() {
  latitude += (Math.random() - 0.5) * 0.0006;
  longitude += (Math.random() - 0.5) * 0.0006;
}

async function tick(token) {
  step();
  const res = await fetch(`${BASE_URL}/walks/${WALK_ID}/location`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ latitude, longitude }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`[simulate-location] ${res.status}: ${data.error || JSON.stringify(data)}`);
    return false;
  }
  console.log(`[simulate-location] walk ${WALK_ID} -> (${latitude.toFixed(6)}, ${longitude.toFixed(6)}) @ ${data.updatedAt}`);
  return true;
}

async function main() {
  console.log(`[simulate-location] logueando como ${EMAIL}...`);
  const token = await login();
  console.log(`[simulate-location] listo. Mandando ubicación cada ${INTERVAL_MS}ms. Ctrl+C para cortar.`);

  const run = async () => {
    const ok = await tick(token);
    if (!ok) {
      console.error('[simulate-location] cortando: el paseo puede no estar accepted/in_progress, o el walker no es el asignado.');
      process.exit(1);
    }
  };

  await run();
  setInterval(run, INTERVAL_MS);
}

main().catch((err) => {
  console.error('[simulate-location] error fatal:', err.message);
  process.exit(1);
});
