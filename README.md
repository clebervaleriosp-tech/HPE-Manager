# HPE Manager

Aplicativo web local para planejar e simular atualizações em lote de servidores HPE ProLiant DL360 Gen10.

## Executar

Requer Node.js 18 ou superior.

```powershell
npm install
npm start
```

Abra `http://localhost:3000`.

## API

- `GET /api/servidores` — inventário simulado e bundles homologados.
- `POST /api/lotes/validar` — recebe `{ "servidores": ["srv-01"] }`.
- `POST /api/lotes/executar` — recebe servidores, `bundle` e `concorrencia`.
- `GET /api/lotes` — histórico e progresso dos lotes da sessão.

## Testes

`npm test` usa o executor nativo do Node; esta primeira versão não possui testes automatizados ainda, portanto o comando termina sem testes encontrados quando o Node suportar essa condição.

## Limitações e segurança

Esta é uma simulação completa: dados, validações, progresso, falha e logs vivem somente em memória e são perdidos ao reiniciar o processo. Não há chamadas reais a iLO, Redfish, IPMI, SSH ou qualquer equipamento/rede. O aplicativo não solicita, armazena ou expõe credenciais.

Uma integração de produção futura deve ser feita exclusivamente por um backend autenticado e autorizado, usando cofre de segredos, trilha de auditoria e a API Redfish do iLO 5; nunca credenciais no navegador.
