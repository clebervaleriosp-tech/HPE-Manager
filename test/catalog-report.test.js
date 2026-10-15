const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { isValidAddress } = require('../services/validators');
const { PackageCatalogService } = require('../services/PackageCatalogService');
const { filterInventory, toCsv } = require('../services/ReportService');

test('valida sintaxe de IP e hostname sem rede', () => { assert.equal(isValidAddress('192.168.10.20'), true); assert.equal(isValidAddress('ilo-lab.example.local'), true); assert.equal(isValidAddress('host com espaco'), false); assert.equal(isValidAddress('999.1.1.1'), false); });

test('upload local seguro calcula SHA-256 e grava fora de public', t => { const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'hpe-upload-')); t.after(() => fs.rmSync(folder, { recursive: true, force: true })); const data = { pacotes: [] }; const catalog = new PackageCatalogService({ data, persist: () => {}, uploadDir: folder }); const pacote = catalog.upload({ buffer: Buffer.from('firmware de laboratorio'), filename: '../../nao-executar.bin', fabricante:'HPE', tipo: 'BIOS', versao: '1.2.3', modeloAlvo: 'DL360 Gen10', user: { nome: 'Admin' } }); assert.equal(pacote.sha256, '51c957c962e685f5537c53f25fb3ee392891c48c868d61aacb48b963bc9369f8'); assert.equal(fs.existsSync(path.join(folder, pacote.arquivoLocal)), true); assert.equal(pacote.status, 'pendente'); });

test('filtros e exportacao CSV preservam somente inventario selecionado', () => { const rows = [{ nome:'A',grupo:'PRD',ambiente:'P',bios:'B1',ilo:'I1',saude:'adequada',alertas:[],endereco:'host-a',portaHttps:443,modelo:'DL',ultimaColeta:'x' }, { nome:'B',grupo:'HML',ambiente:'H',bios:'B2',ilo:'I2',saude:'aviso',alertas:['aviso'],endereco:'host-b',portaHttps:443,modelo:'DL',ultimaColeta:'x' }]; const filtered = filterInventory(rows, { grupo:'HML', alertas:'com-alertas' }); assert.equal(filtered.length, 1); const csv = toCsv(filtered); assert.match(csv, /nome,endereco/); assert.match(csv, /"B"/); assert.doesNotMatch(csv, /"A"/); });
