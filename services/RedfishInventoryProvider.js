class RedfishInventoryProvider {
  constructor() { this.name = 'RedfishInventoryProvider'; this.enabled = false; }
  async collectInventory() { throw new Error('RedfishInventoryProvider desabilitado: nenhuma conexao de rede foi implementada.'); }
  async readBiosVersion() { throw new Error('Provider desabilitado.'); }
  async readIloVersion() { throw new Error('Provider desabilitado.'); }
  async readHealth() { throw new Error('Provider desabilitado.'); }
  async readAlerts() { throw new Error('Provider desabilitado.'); }
}
module.exports = { RedfishInventoryProvider };
