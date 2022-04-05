const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CelulaRitmicaSchema = Schema({
    figuras: String,
    simple: Boolean,
    valor: String,
    imagen:{
        data: Buffer,
        contentType: String
    },
});

module.exports = mongoose.model('CelulaRitmica', CelulaRitmicaSchema);
