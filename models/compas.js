const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompasSchema = Schema({
    numerador: Number,
    denominador: Number, // Todos los denominadores iguales van a ser equivalentes
});

module.exports = mongoose.model('Compas', CompasSchema);
