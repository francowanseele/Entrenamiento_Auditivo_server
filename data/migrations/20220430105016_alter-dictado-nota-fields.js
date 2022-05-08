/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('Dictado_Nota', (table) => {
        table.dropColumn('Nota');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('Dictado_Nota', (table) => {
        table.string('Nota', 10);
    });
};
