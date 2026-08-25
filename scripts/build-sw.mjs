/*
 * vite build のあとに実行し、dist/sw.js へ
 *   - 事前キャッシュするファイルの一覧
 *   - 中身から作ったビルドごとのキャッシュ名
 * を埋め込む。ファイル名にハッシュが入るアセットを手で書かずに済ませるため。
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const CACHEABLE = /\.(js|css|html|png|svg|webmanifest|woff2?)$/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(dist)
  .map((full) => relative(dist, full))
  .filter((rel) => rel !== 'sw.js' && CACHEABLE.test(rel))
  .sort();

const hash = createHash('sha256');
for (const rel of files) {
  hash.update(rel);
  hash.update(readFileSync(join(dist, rel)));
}
const version = hash.digest('hex').slice(0, 10);
const precache = files.map((rel) => `./${rel.split(sep).join(posix.sep)}`);

const swPath = join(dist, 'sw.js');
const source = readFileSync(swPath, 'utf8');
const patched = source
  .replace(/^const PRECACHE = .*\/\* build:precache \*\/$/m, `const PRECACHE = ${JSON.stringify(precache)}; /* build:precache */`)
  .replace(/^const CACHE = .*\/\* build:cache \*\/$/m, `const CACHE = 'smokefree-${version}'; /* build:cache */`);

if (patched === source) {
  console.error('build-sw: sw.js の目印が見つからず、書き換えられませんでした');
  process.exit(1);
}

writeFileSync(swPath, patched);
console.log(`build-sw: ${precache.length} 件を事前キャッシュ (smokefree-${version})`);
