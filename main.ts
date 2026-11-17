import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameSrc = join(rootDir, 'game');
const shotsSrc = join(rootDir, 'screenshots');
const gameOut = join(outDir, 'game');
const shotsOut = join(outDir, 'screenshots');

mkdirSync(outDir, { recursive: true });
cpSync(gameSrc, gameOut, { recursive: true });

mkdirSync(shotsOut, { recursive: true });
if (existsSync(shotsSrc)) {
  for (const entry of readdirSync(shotsSrc)) {
    if (/\.(?:jpe?g|png)$/i.test(entry)) {
      cpSync(join(shotsSrc, entry), join(shotsOut, entry));
    }
  }
}

const dossierBytes = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossierBytes);
