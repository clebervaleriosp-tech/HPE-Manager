class HpeIloProvider { constructor(){this.name='HpeIloProvider';this.enabled=false;} async collect(){throw new Error('HPE iLO bloqueado: adaptador sem rede nesta fase.');} }
module.exports={HpeIloProvider};
