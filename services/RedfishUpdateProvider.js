class RedfishUpdateProvider {
  constructor() { this.name = 'RedfishUpdateProvider'; this.enabled = false; }
  async validate() { throw new Error('Provider Redfish desabilitado: nenhuma chamada de rede e permitida.'); }
  async execute() { throw new Error('Provider Redfish desabilitado: nenhuma chamada de rede e permitida.'); }
}
module.exports = { RedfishUpdateProvider };
