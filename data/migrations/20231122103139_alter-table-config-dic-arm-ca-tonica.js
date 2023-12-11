/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('ConfiguracionDictadoArmonico_CampoArmonico', (table) => {
        table.integer('Nivel');
        table.boolean('Tonicalizado');
        table.string('From');
        table.integer('Funcion');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('ConfiguracionDictadoArmonico_CampoArmonico', (table) => {
        table.dropColumn('Nivel');
        table.dropColumn('Tonicalizado');
        table.dropColumn('From');
        table.dropColumn('Funcion');
    });
};
