/**
 * Writes .br and .gz copies of every compressible file in dist/, at the highest
 * settings, for nginx to send as-is (brotli_static / gzip_static).
 *
 * Smaller than compressing on the fly — the main script is about a tenth smaller
 * than nginx's live brotli — and it takes compression off a one-core server at
 * exactly the moment traffic spikes. The copies are made by each build, inside
 * the release, so a deploy can never pair a file with a stale compressed copy.
 */
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import zlib from "node:zlib";

const brotli = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".xml", ".txt", ".svg", ".json", ".ico"]);
// Below this the headers outweigh the saving.
const MIN_BYTES = 512;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let files = 0, before = 0, afterBr = 0;
for await (const file of walk(dist)) {
  if (!COMPRESSIBLE.has(path.extname(file)) || (await stat(file)).size < MIN_BYTES) continue;
  const body = await readFile(file);
  const [br, gz] = await Promise.all([
    brotli(body, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: body.length,
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      },
    }),
    gzip(body, { level: zlib.constants.Z_BEST_COMPRESSION }),
  ]);
  if (br.length < body.length) await writeFile(`${file}.br`, br);
  if (gz.length < body.length) await writeFile(`${file}.gz`, gz);
  files += 1; before += body.length; afterBr += Math.min(br.length, body.length);
}
console.log(`  precompressed ${files} files: ${(before / 1024).toFixed(0)} KB -> ${(afterBr / 1024).toFixed(0)} KB brotli`);
