const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompasSchema = Schema({
    numerador: Number,
    denominador: Number,
    simple: Boolean,
});

module.exports = mongoose.model('Compas', CompasSchema);
