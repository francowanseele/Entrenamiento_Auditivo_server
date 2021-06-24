const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CelulaRitmicaSchema = Schema({
    figuras: [String],
    simple: Boolean,
});

module.exports = mongoose.model('CelulaRitmica', CelulaRitmicaSchema);
