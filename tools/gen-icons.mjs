// tools/gen-icons.mjs — PNG mínimo sin dependencias (zlib es builtin de Node).
// Diseño: fondo oscuro factoría, aro ámbar tipo "detector de humo".
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const CRC_TABLA = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLA[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, datos) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([len, cuerpo, crc]);
}

function png(tam, pinto) {
  const px = Buffer.alloc(tam * tam * 4);
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const [r, g, b, a] = pinto(x + 0.5, y + 0.5, tam);
      const i = (y * tam + x) * 4;
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tam, 0);
  ihdr.writeUInt32BE(tam, 4);
  ihdr[8] = 8; // profundidad de bit
  ihdr[9] = 6; // RGBA
  const filas = Buffer.concat(
    Array.from({ length: tam }, (_, y) =>
      Buffer.concat([Buffer.from([0]), px.subarray(y * tam * 4, (y + 1) * tam * 4)])
    )
  );
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(filas)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function diseno(x, y, tam) {
  const cx = tam / 2;
  const cy = tam / 2;
  const d = Math.hypot(x - cx, y - cy) / (tam / 2);
  if (d < 0.3) return [22, 26, 32, 255]; // botón central
  if (d < 0.42) return [255, 176, 0, 255]; // aro ámbar
  if (d < 0.46) return [176, 120, 0, 255]; // filo
  return [13, 15, 18, 255]; // fondo
}

mkdirSync("icons", { recursive: true });
for (const tam of [16, 48, 128]) {
  writeFileSync(`icons/icon${tam}.png`, png(tam, diseno));
  console.log(`icons/icon${tam}.png OK`);
}
