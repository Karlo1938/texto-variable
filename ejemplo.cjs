const { texto, textoCompleto } = require('./index.cjs');

// El texto completo queda en esta variable sin mostrar los datos sensibles.
const completo = textoCompleto();
console.log(`Texto público: ${texto.length} caracteres. Texto completo: ${completo.length} caracteres.`);
