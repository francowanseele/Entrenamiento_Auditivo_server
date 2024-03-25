/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex('ConfiguracionDictadoArmonico_CampoArmonico').whereNull('Nivel').update({ Nivel: 0 });
    await knex('ConfiguracionDictadoArmonico_CampoArmonico').whereNull('Tonicalizado').update({ Tonicalizado: false });
    await knex('ConfiguracionDictadoArmonico_CampoArmonico').whereNull('From').update({ From: '' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
