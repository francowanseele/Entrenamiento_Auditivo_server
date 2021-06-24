const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Curso = require('./curso');

const InstitutoSchema = Schema({
    nombre: String,
    curso: [{ type: mongoose.Schema.Types.ObjectId, ref: Curso }],
});

module.exports = mongoose.model('Instituto', InstitutoSchema);
