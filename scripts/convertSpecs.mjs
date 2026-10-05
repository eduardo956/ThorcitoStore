// Convierte especificaciones_t_cnicas_iphone_11.md (JSON con escapes markdown) a src/data/iphoneSpecs.json
import fs from 'node:fs';

const raw = fs.readFileSync('especificaciones_t_cnicas_iphone_11.md', 'utf8');
const clean = raw.replace(/\\([\[\]_])/g, '$1');
const json = JSON.parse(clean);
fs.writeFileSync('src/data/iphoneSpecs.json', JSON.stringify(json.devices, null, 1));
console.log(`OK: ${json.devices.length} modelos`);
console.log(json.devices.map((d) => d.model_name).join(' | '));
