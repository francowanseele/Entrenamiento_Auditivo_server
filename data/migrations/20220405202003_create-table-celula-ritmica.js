/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('CelulaRitmica', (table) => {
        table.increments();
        table.boolean('Simple').notNullable();
        table.string('Valor', 10);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('CelulaRitmica');
};
