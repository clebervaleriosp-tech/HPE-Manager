class IpmiProvider { constructor(){this.name='IpmiProvider';this.enabled=false;} async collect(){throw new Error('IPMI bloqueado: adaptador sem rede nesta fase.');} }
module.exports={IpmiProvider};
