/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('Dictado_CelulaRitmica', (table) => {
        table.integer('OrdenPulsos');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('Dictado_CelulaRitmica', (table) => {
        table.dropColumn('OrdenPulsos');
    });
};
