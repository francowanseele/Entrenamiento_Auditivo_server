/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('DictadoArmonico', (table) => {
        table.string('EsquemaDictado');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('DictadoArmonico', (table) => {
        table.dropColumn('EsquemaDictado');
    });
};
