class DellIdracProvider { constructor(){this.name='DellIdracProvider';this.enabled=false;} async collect(){throw new Error('Dell iDRAC bloqueado: adaptador sem rede nesta fase.');} }
module.exports={DellIdracProvider};
