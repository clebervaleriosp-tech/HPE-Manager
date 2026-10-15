const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
class PackageCatalogService {
  constructor({ data, persist, uploadDir }) { this.data = data; this.persist = persist; this.uploadDir = uploadDir; this.data.pacotes ||= []; }
  upload({ buffer, filename, fabricante, tipo, versao, modeloAlvo, user }) { if (!buffer?.length) throw new Error('Envie um arquivo local nao vazio.'); if (!fabricante || !tipo || !versao || !modeloAlvo) throw new Error('Fabricante, tipo, versao e modelo-alvo exigem confirmacao manual.'); if (!['BIOS', 'BMC', 'Firmware'].includes(tipo)) throw new Error('Tipo de pacote invalido.'); if (buffer.length > 50 * 1024 * 1024) throw new Error('Arquivo excede o limite local de 50 MB.'); fs.mkdirSync(this.uploadDir, { recursive: true }); const id = `pkg-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`; const extension = path.extname(filename || '').replace(/[^.a-zA-Z0-9]/g, '').slice(0, 12); const storageName = `${id}${extension}`; fs.writeFileSync(path.join(this.uploadDir, storageName), buffer, { flag: 'wx' }); const pacote = { id, nomeOriginal: path.basename(filename || 'pacote.bin'), arquivoLocal: storageName, sha256: crypto.createHash('sha256').update(buffer).digest('hex'), tamanho: buffer.length, enviadoEm: new Date().toISOString(), fabricante, tipo, versao, modeloAlvo, status: 'pendente', observacoes:'', enviadoPor: user.nome }; this.data.pacotes.unshift(pacote); this.persist(); return pacote; }
  list() { return this.data.pacotes; }
  status(id, status, user) { if (!['homologado', 'reprovado', 'arquivado'].includes(status)) throw new Error('Status invalido.'); const p = this.data.pacotes.find(x => x.id === id); if (!p) throw new Error('Pacote nao encontrado.'); p.status = status; p.decididoEm = new Date().toISOString(); p.decididoPor = user.nome; this.persist(); return p; }
}
module.exports = { PackageCatalogService };
