const net = require('node:net');
function isValidHostname(value) { if (typeof value !== 'string' || value.length > 253) return false; return value.split('.').every(label => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)); }
function isValidAddress(value) { if (net.isIP(value) !== 0) return true; if (/^[0-9.]+$/.test(value)) return false; return isValidHostname(value); }
function validateServer(input) { const errors = []; if (!input.nome?.trim()) errors.push('Nome e obrigatorio.'); if (!isValidAddress(input.endereco || '')) errors.push('IP ou hostname invalido.'); const porta = Number(input.portaHttps); if (!Number.isInteger(porta) || porta < 1 || porta > 65535) errors.push('Porta HTTPS invalida.'); if (!input.modelo?.trim()) errors.push('Modelo e obrigatorio.'); return errors; }
module.exports = { isValidHostname, isValidAddress, validateServer };
