/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('GiroMelodico', (table) => {
        table.boolean('DelSistema');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('GiroMelodico', (table) => {
        table.dropColumn('DelSistema');
    });
};
