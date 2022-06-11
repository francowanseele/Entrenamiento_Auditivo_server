/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('Curso', (table) => {
        table.integer('CreadoPor');
        table.foreign('CreadoPor').references('Usuario.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('Curso', (table) => {
        table.dropColumn('CreadoPor');
    });
};
