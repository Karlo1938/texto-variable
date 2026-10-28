const { TextDecoder } = require('node:util');
const { texto } = require('./texto.json');

function recuperarFragmento(valor, nombre) {
  if (typeof valor !== 'string' || valor.length === 0) {
    throw new Error(`Falta la variable ${nombre} en el entorno.`);
  }
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(valor)) {
    throw new Error(`La variable ${nombre} no contiene Base64 válido.`);
  }
  const bytes = Buffer.from(valor, 'base64');
  if (bytes.toString('base64') !== valor) {
    throw new Error(`La variable ${nombre} no contiene Base64 canónico.`);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new Error(`La variable ${nombre} no contiene UTF-8 válido.`);
  }
}

// Solo reconstruye una cadena: no ejecuta el texto ni hace peticiones.
function textoCompleto(entorno = process.env) {
  const cabeceras = recuperarFragmento(entorno.TEXTO_CABECERAS_BASE64, 'TEXTO_CABECERAS_BASE64');
  const cuerpo = recuperarFragmento(entorno.TEXTO_CUERPO_BASE64, 'TEXTO_CUERPO_BASE64');
  return texto.replace(/\[\[(CABECERAS_PRIVADAS|CUERPO_PRIVADO)\]\]/g, (_, tipo) =>
    tipo === 'CABECERAS_PRIVADAS' ? cabeceras : cuerpo
  );
}

module.exports = { texto, textoCompleto };
