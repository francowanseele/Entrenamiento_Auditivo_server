/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('ConfiguracionAcordeJazz', (table) => {
        table.boolean('Eliminado');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('ConfiguracionAcordeJazz', (table) => {
        table.dropColumn('Eliminado');
    });
};
