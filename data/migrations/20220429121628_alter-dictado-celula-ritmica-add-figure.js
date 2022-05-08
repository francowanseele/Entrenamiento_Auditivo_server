/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('Dictado_CelulaRitmica', (table) => {
        table.string('Figuras');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('Dictado_CelulaRitmica', (table) => {
        table.dropColumn('Figuras');
    });
};
