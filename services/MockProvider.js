const { MockInventoryProvider } = require('./MockInventoryProvider');
class MockProvider extends MockInventoryProvider { constructor(config){super(config);this.name='MockProvider';} detectManufacturer(server){return { fabricante:server.fabricante || 'Generico', origem:'simulado', confidence:'simulada' };} }
module.exports={MockProvider};
