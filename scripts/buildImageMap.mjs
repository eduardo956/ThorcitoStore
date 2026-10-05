// Genera src/data/iphoneImages.json probando en el CDN de Apple Store qué assets "finish-select" existen
// por modelo y color. Solo guarda los que responden 200 (image/jpeg).
import fs from 'node:fs';

const CDN = 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/';

// [id del catálogo, base del asset, tamaño, colores a probar, fechas candidatas]
const D_OLD = ['202207', '202209', '202111', '202109', '202011', '202203', '202007', '201909'];
const models = [
  ['iphone-11', 'iphone-11', '6-1inch', ['purple', 'yellow', 'green', 'black', 'white', 'red'], ['201909', '202009']],
  ['iphone-11-pro', 'iphone-11-pro', '5-8inch', ['midnightgreen', 'spacegray', 'silver', 'gold'], ['201909']],
  ['iphone-11-pro-max', 'iphone-11-pro', '6-5inch', ['midnightgreen', 'spacegray', 'silver', 'gold'], ['201909']],
  ['iphone-se-2nd-generation-2020', 'iphone-se', '4-7inch', ['black', 'white', 'red'], ['202004', '202007', '202009']],
  ['iphone-12-mini', 'iphone-12', '5-4inch', ['blue', 'purple', 'green', 'black', 'white', 'red'], D_OLD],
  ['iphone-12', 'iphone-12', '6-1inch', ['blue', 'purple', 'green', 'black', 'white', 'red'], D_OLD],
  ['iphone-12-pro', 'iphone-12-pro', '6-1inch', ['pacificblue', 'graphite', 'silver', 'gold'], D_OLD],
  ['iphone-12-pro-max', 'iphone-12-pro', '6-7inch', ['pacificblue', 'graphite', 'silver', 'gold'], D_OLD],
  ['iphone-13-mini', 'iphone-13', '5-4inch', ['pink', 'blue', 'midnight', 'starlight', 'red', 'green'], D_OLD],
  ['iphone-13', 'iphone-13', '6-1inch', ['pink', 'blue', 'midnight', 'starlight', 'red', 'green'], D_OLD],
  ['iphone-13-pro', 'iphone-13-pro', '6-1inch', ['sierrablue', 'graphite', 'gold', 'silver', 'alpinegreen'], D_OLD],
  ['iphone-13-pro-max', 'iphone-13-pro', '6-7inch', ['sierrablue', 'graphite', 'gold', 'silver', 'alpinegreen'], D_OLD],
  ['iphone-se-3rd-generation-2022', 'iphone-se', '4-7inch', ['midnight', 'starlight', 'red'], ['202203', '202207', '202209']],
  ['iphone-14', 'iphone-14', '6-1inch', ['blue', 'purple', 'midnight', 'starlight', 'red', 'yellow'], ['202209', '202303']],
  ['iphone-14-plus', 'iphone-14', '6-7inch', ['blue', 'purple', 'midnight', 'starlight', 'red', 'yellow'], ['202209', '202303']],
  ['iphone-14-pro', 'iphone-14-pro', '6-1inch', ['deeppurple', 'gold', 'silver', 'spaceblack'], ['202209']],
  ['iphone-14-pro-max', 'iphone-14-pro', '6-7inch', ['deeppurple', 'gold', 'silver', 'spaceblack'], ['202209']],
  ['iphone-15', 'iphone-15', '6-1inch', ['blue', 'pink', 'yellow', 'green', 'black'], ['202309']],
  ['iphone-15-plus', 'iphone-15', '6-7inch', ['blue', 'pink', 'yellow', 'green', 'black'], ['202309']],
  ['iphone-15-pro', 'iphone-15-pro', '6-1inch', ['naturaltitanium', 'bluetitanium', 'whitetitanium', 'blacktitanium'], ['202309']],
  ['iphone-15-pro-max', 'iphone-15-pro', '6-7inch', ['naturaltitanium', 'bluetitanium', 'whitetitanium', 'blacktitanium'], ['202309']],
  ['iphone-16', 'iphone-16', '6-1inch', ['ultramarine', 'teal', 'pink', 'white', 'black'], ['202409']],
  ['iphone-16-plus', 'iphone-16', '6-7inch', ['ultramarine', 'teal', 'pink', 'white', 'black'], ['202409']],
  ['iphone-16-pro', 'iphone-16-pro', '6-3inch', ['blacktitanium', 'whitetitanium', 'naturaltitanium', 'deserttitanium'], ['202409']],
  ['iphone-16-pro-max', 'iphone-16-pro', '6-9inch', ['blacktitanium', 'whitetitanium', 'naturaltitanium', 'deserttitanium'], ['202409']],
];

const urlOf = (asset) => `${CDN}${asset}?wid=1000&hei=1000&fmt=jpeg&qlt=90`;
const ok = async (asset) => {
  try {
    const r = await fetch(urlOf(asset), { headers: { 'user-agent': 'Mozilla/5.0' } });
    return r.status === 200 && (r.headers.get('content-type') || '').includes('image');
  } catch {
    return false;
  }
};

const result = {};
for (const [id, base, size, colors, dates] of models) {
  result[id] = {};
  await Promise.all(
    colors.map(async (color) => {
      for (const date of dates) {
        const asset = `${base}-finish-select-${date}-${size}-${color}`;
        if (await ok(asset)) {
          result[id][color] = asset;
          return;
        }
      }
    })
  );
  const got = Object.keys(result[id]);
  console.log(`${got.length ? 'OK ' : 'MISS'} ${id}: ${got.length}/${colors.length} (${got.join(', ')})`);
}

fs.writeFileSync('src/data/iphoneImages.json', JSON.stringify(result, null, 1));
