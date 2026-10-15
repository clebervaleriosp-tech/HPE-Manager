# C³ Update

Plataforma local multivendor para inventário, saúde e atualizações **simuladas**. Ela jamais acessa servidores ou redes de infraestrutura.

## Executar e testar

Requer Node.js 18+.

```powershell
npm install
npm test
npm start
```

Abra `http://localhost:3000`. Perfis locais de demonstracao: `visualizador` / `visualizar`, `operador` / `operar`, e `admin` / `administrar`.

## Arquitetura

- `server.js`: API Express, autenticacao local e autorizacao por papel.
- `services/SimulatorUpdateProvider.js`: unico provedor ativo; valida, executa progresso e falhas somente simulados.
- `services/RedfishUpdateProvider.js`: contrato inicial, explicitamente desabilitado; nao contem chamadas de rede.
- `services/UpdateService.js`: regra de negocio, lotes e auditoria.
- `services/LocalHistoryStore.js`: persistencia de lotes, logs e auditoria em `data/history.json` (ignorado pelo Git).
- `services/MockProvider.js`: único adaptador ativo em modo laboratório; gera inventário, saúde, alertas e detecção de fabricante simulados.
- `services/HpeIloProvider.js`, `DellIdracProvider.js` e `IpmiProvider.js`: contratos desabilitados, sem chamadas de rede.
- `services/AutomationService.js`: biblioteca fechada de automações aprovadas, com saída e auditoria simuladas; não existe terminal livre.
- `services/RedfishInventoryProvider.js`: contrato de leitura futura; desabilitado e sem implementacao de rede.
- `services/PackageCatalogService.js`: recebe binarios locais sem os executar, grava-os em `uploads/` (fora de `public/`) e calcula SHA-256.
- `services/ReportService.js`: filtros e exportacoes JSON/CSV locais.
- `test/api.test.js`: testes reais com `node --test` de inventario, validacao, bloqueios, execucao e acompanhamento.

## Cadastro, catalogo e relatorios

Administradores podem cadastrar, editar, remover e importar servidores por `POST /api/servidores`, `PUT/DELETE /api/servidores/:id` e `POST /api/servidores/importar`. O cadastro valida apenas a sintaxe de IP/hostname e porta HTTPS; nao tenta contato de rede.

O catalogo usa `POST /api/pacotes/upload` com corpo binario local e metadados manuais (`tipo`, `versao`, `modeloAlvo`). O arquivo nunca e executado. `PATCH /api/pacotes/:id/status` permite homologar, reprovar ou arquivar. Nenhuma compatibilidade e inferida.

`GET /api/relatorios` aceita filtros por grupo, ambiente, BIOS, iLO, saude e alertas. `GET /api/relatorios/exportar?formato=csv` ou `json` cria os arquivos locais de relatorio.

## API protegida

`POST /api/auth/login` cria um token local em memoria. Envie-o em `x-local-token` nas demais chamadas. Visualizacao consulta inventario/historico; operador e administrador validam e executam lotes; administrador tambem acessa `/api/auditoria` e `/api/providers`.

## Modo laboratorio e integracao futura com Redfish/iLO 5

O inventario apresentado é produzido pelo `MockProvider`, configurado para o laboratório. Ele não consulta nenhuma máquina. Os cenários de offline, alerta crítico, firmware desatualizado, incompatibilidade e coleta bem-sucedida são locais e simulados.

Uma fase de producao deve manter o frontend sem segredos e habilitar os providers Redfish somente em backend autenticado. Deve usar um cofre de segredos, TLS, RBAC, aprovacao de mudanca, janela de manutencao, trilha de auditoria imutavel e a API Redfish do iLO 5. Nenhuma credencial real, token, IP de producao, upload ou configuracao local deve ser versionada no Git.
