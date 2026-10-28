const { readFileSync } = require('node:fs');
const { texto, textoCompleto } = require('./index.cjs');

function comprobar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

comprobar(typeof texto === 'string', 'El texto exportado debe ser una cadena.');
comprobar(texto.includes('[[CABECERAS_PRIVADAS]]') && texto.includes('[[CUERPO_PRIVADO]]'), 'Faltan los marcadores.');
try {
  textoCompleto({});
  throw new Error('Debería rechazar la ausencia de variables.');
} catch (error) {
  comprobar(error.message.includes('Falta la variable'), 'No se ha rechazado una variable ausente.');
}

const cabecerasFalsas = "cabeceras: ñ 👋\n $& $' $` [[CUERPO_PRIVADO]]";
const cuerpoFalso = 'cuerpo de prueba\n';
const falso = {
  TEXTO_CABECERAS_BASE64: Buffer.from(cabecerasFalsas, 'utf8').toString('base64'),
  TEXTO_CUERPO_BASE64: Buffer.from(cuerpoFalso, 'utf8').toString('base64')
};
const reconstruido = textoCompleto(falso);
const marcadorCabeceras = '[[CABECERAS_PRIVADAS]]';
const marcadorCuerpo = '[[CUERPO_PRIVADO]]';
const posicionCabeceras = texto.indexOf(marcadorCabeceras);
const posicionCuerpo = texto.indexOf(marcadorCuerpo);
const esperado = texto.slice(0, posicionCabeceras) + cabecerasFalsas +
  texto.slice(posicionCabeceras + marcadorCabeceras.length, posicionCuerpo) + cuerpoFalso +
  texto.slice(posicionCuerpo + marcadorCuerpo.length);
comprobar(reconstruido === esperado, 'La prueba Unicode y de sustitución literal no coincide.');
try {
  textoCompleto({ ...falso, TEXTO_CUERPO_BASE64: '###' });
  throw new Error('Debería rechazar Base64 inválido.');
} catch (error) {
  comprobar(error.message.includes('Base64 válido'), 'No se ha rechazado el Base64 inválido.');
}
try {
  textoCompleto({ ...falso, TEXTO_CUERPO_BASE64: 'Zh==' });
  throw new Error('Debería rechazar Base64 no canónico.');
} catch (error) {
  comprobar(error.message.includes('Base64 canónico'), 'No se ha rechazado el Base64 no canónico.');
}
try {
  textoCompleto({ ...falso, TEXTO_CUERPO_BASE64: Buffer.from([0xff]).toString('base64') });
  throw new Error('Debería rechazar UTF-8 inválido.');
} catch (error) {
  comprobar(error.message.includes('UTF-8 válido'), 'No se ha rechazado el UTF-8 inválido.');
}

if (process.argv[2]) {
  const original = readFileSync(process.argv[2], 'utf8');
  comprobar(textoCompleto() === original, 'El texto completo no coincide con el archivo original.');
  console.log('Texto reconstruido idéntico al archivo original; datos sensibles no mostrados.');
} else {
  console.log('Pruebas locales correctas; datos sensibles no mostrados.');
}
