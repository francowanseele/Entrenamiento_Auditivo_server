/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('UsuarioDicta_Curso', (table) => {
        table.boolean('Estado');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('UsuarioDicta_Curso', (table) => {
        table.dropColumn('Estado');
    });
};
