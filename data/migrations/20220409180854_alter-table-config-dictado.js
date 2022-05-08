/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('ConfiguracionDictado', (table) => {
        table.integer('CreadorUsuarioId').notNullable().index();
        table.foreign('CreadorUsuarioId').references('Usuario.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('ConfiguracionDictado', (table) => {
        table.dropColumn('CreadorUsuarioId');
    });
};
