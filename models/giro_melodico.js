const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GiroMelodicoSchema = Schema({
    notas: [String],
    mayor: Boolean,
});

module.exports = mongoose.model('GiroMelodico', GiroMelodicoSchema);
