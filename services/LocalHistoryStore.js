const fs = require('node:fs');
const path = require('node:path');

class LocalHistoryStore {
  constructor(filePath = path.join(__dirname, '..', 'data', 'history.json')) { this.filePath = filePath; }
  load() { try { return JSON.parse(fs.readFileSync(this.filePath, 'utf8')); } catch { return { lotes: [], auditoria: [] }; } }
  save(data) { fs.mkdirSync(path.dirname(this.filePath), { recursive: true }); fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8'); }
}
module.exports = { LocalHistoryStore };
