import fs from 'node:fs';
const file = process.argv[2] || 'sbom.cdx.json';
const sbom = JSON.parse(fs.readFileSync(file, 'utf8'));
if (sbom.bomFormat !== 'CycloneDX' || !sbom.components?.length) throw new Error('SBOM CycloneDX vacío o inválido');
const byType = {};
for (const c of sbom.components) byType[c.type] = (byType[c.type] || 0) + 1;
console.log(JSON.stringify({ bomFormat: sbom.bomFormat, specVersion: sbom.specVersion, components: sbom.components.length, byType, withPurl: sbom.components.filter(c => c.purl).length }, null, 2));
