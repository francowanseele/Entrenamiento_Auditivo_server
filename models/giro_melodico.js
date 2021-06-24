const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GiroMelodicoSchema = Schema({
    notas: [String],
});

module.exports = mongoose.model('GiroMelodico', GiroMelodicoSchema);
