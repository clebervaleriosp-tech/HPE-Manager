const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const servidores = [
  { id: 'srv-01', nome: 'DL360G10-PRD-01', ip: '10.20.1.11', estado: 'online', bios: 'U30 v2.60', ilo: 'iLO 5 v2.81', saude: 'adequada', grupo: 'Produção', backup: true, janela: true },
  { id: 'srv-02', nome: 'DL360G10-PRD-02', ip: '10.20.1.12', estado: 'online', bios: 'U30 v2.54', ilo: 'iLO 5 v2.77', saude: 'aviso', grupo: 'Produção', backup: true, janela: true },
  { id: 'srv-03', nome: 'DL360G10-HML-01', ip: '10.20.2.21', estado: 'online', bios: 'U30 v2.50', ilo: 'iLO 5 v2.70', saude: 'adequada', grupo: 'Homologação', backup: true, janela: true },
  { id: 'srv-04', nome: 'DL360G10-HML-02', ip: '10.20.2.22', estado: 'offline', bios: 'U30 v2.42', ilo: 'iLO 5 v2.65', saude: 'adequada', grupo: 'Homologação', backup: true, janela: true },
  { id: 'srv-05', nome: 'DL360G10-DEV-01', ip: '10.20.3.31', estado: 'online', bios: 'U30 v2.40', ilo: 'iLO 5 v2.60', saude: 'critica', grupo: 'Desenvolvimento', backup: false, janela: true },
  { id: 'srv-06', nome: 'DL360G10-DR-01', ip: '10.20.4.41', estado: 'online', bios: 'U30 v2.58', ilo: 'iLO 5 v2.79', saude: 'adequada', grupo: 'Disaster Recovery', backup: true, janela: false },
  { id: 'srv-07', nome: 'DL360G10-DR-02', ip: '10.20.4.42', estado: 'online', bios: 'U30 v2.60', ilo: 'iLO 5 v2.81', saude: 'adequada', grupo: 'Disaster Recovery', backup: true, janela: true }
];
const bundles = [{ id: 'spp-2026-03', nome: 'SPP 2026.03 — Homologado', bios: 'U30 v2.68', ilo: 'iLO 5 v3.10', smartArray: 'v3.00' }];
const lotes = [];

function validar(ids) {
  return ids.map(id => {
    const servidor = servidores.find(s => s.id === id);
    if (!servidor) return { id, classificacao: 'bloqueado', checks: [], motivo: 'Servidor não localizado.' };
    const checks = [
      { nome: 'Servidor online', ok: servidor.estado === 'online', bloqueia: true },
      { nome: 'Saúde do hardware adequada', ok: servidor.saude === 'adequada', bloqueia: servidor.saude === 'critica' },
      { nome: 'Backup de configuração', ok: servidor.backup, bloqueia: true },
      { nome: 'Janela de manutenção aprovada', ok: servidor.janela, bloqueia: true },
      { nome: 'Impacto: reinicialização necessária', ok: true, aviso: true }
    ];
    const bloqueado = checks.some(c => !c.ok && c.bloqueia);
    const aviso = !bloqueado && checks.some(c => c.aviso || !c.ok);
    return { id, servidor, checks, classificacao: bloqueado ? 'bloqueado' : aviso ? 'aviso' : 'apto' };
  });
}

function registrar(lote, servidorId, estado, mensagem) {
  const item = lote.servidores.find(s => s.id === servidorId);
  item.estado = estado;
  item.progresso = ({ pendente: 0, validando: 10, atualizando: 55, reiniciando: 82, concluido: 100, falhou: 100 })[estado];
  item.logs.push({ horario: new Date().toLocaleTimeString('pt-BR'), mensagem });
  lote.atualizadoEm = new Date().toISOString();
}
function executarServidor(lote, item, indice) {
  const etapas = [
    ['validando', 'Validações finais do lote iniciadas.'],
    ['atualizando', 'Aplicando componentes do bundle homologado.'],
    ['reiniciando', 'Reinicialização controlada em andamento.'],
    ['concluido', 'Atualização simulada concluída com sucesso.']
  ];
  etapas.forEach(([estado, msg], pos) => setTimeout(() => {
    if (estado === 'concluido' && item.nome.includes('PRD-02')) registrar(lote, item.id, 'falhou', 'Falha simulada: validação pós-reinicialização excedeu o tempo limite.');
    else registrar(lote, item.id, estado, msg);
    if (estado === 'concluido') {
      const acabaram = lote.servidores.every(s => ['concluido', 'falhou', 'bloqueado'].includes(s.estado));
      if (acabaram) { lote.status = 'finalizado'; lote.finalizadoEm = new Date().toISOString(); }
    }
  // Cada grupo só começa depois da onda anterior encerrar: concorrência real simulada.
  }, 800 + (indice * 5_200) + (pos * 1200)));
}

app.get('/api/servidores', (_req, res) => res.json({ servidores, bundles }));
app.post('/api/lotes/validar', (req, res) => {
  const ids = Array.isArray(req.body.servidores) ? req.body.servidores : [];
  if (!ids.length) return res.status(400).json({ erro: 'Selecione pelo menos um servidor.' });
  const resultados = validar(ids);
  res.json({ resultados, resumo: ['apto', 'bloqueado', 'aviso'].reduce((a, k) => ({ ...a, [k]: resultados.filter(r => r.classificacao === k).length }), {}) });
});
app.post('/api/lotes/executar', (req, res) => {
  const ids = Array.isArray(req.body.servidores) ? req.body.servidores : [];
  const bundle = bundles.find(b => b.id === req.body.bundle);
  if (!bundle || !ids.length) return res.status(400).json({ erro: 'Bundle e servidores são obrigatórios.' });
  const resultados = validar(ids);
  const lote = { id: `lote-${Date.now()}`, nome: `Lote ${new Date().toLocaleString('pt-BR')}`, bundle, status: 'em andamento', iniciadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(), concorrencia: Math.min(Math.max(Number(req.body.concorrencia) || 2, 1), 3), servidores: resultados.map(r => ({ id: r.id, nome: r.servidor?.nome || r.id, estado: r.classificacao === 'bloqueado' ? 'bloqueado' : 'pendente', progresso: 0, logs: r.classificacao === 'bloqueado' ? [{ horario: new Date().toLocaleTimeString('pt-BR'), mensagem: 'Bloqueado pelas validações prévias.' }] : [{ horario: new Date().toLocaleTimeString('pt-BR'), mensagem: 'Aguardando vaga de concorrência.' }] })) };
  lotes.unshift(lote);
  lote.servidores.filter(s => s.estado === 'pendente').forEach((item, i) => executarServidor(lote, item, Math.floor(i / lote.concorrencia)));
  if (!lote.servidores.some(s => s.estado === 'pendente')) lote.status = 'finalizado';
  res.status(201).json({ lote });
});
app.get('/api/lotes', (_req, res) => res.json({ lotes }));
app.listen(PORT, () => console.log(`HPE Manager em http://localhost:${PORT}`));
