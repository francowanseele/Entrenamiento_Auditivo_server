/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable(
        'ConfiguracionDictado_GiroMelodico',
        (table) => {
            table.integer('Prioridad').notNullable();
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable(
        'ConfiguracionDictado_GiroMelodico',
        (table) => {
            table.dropColumn('Prioridad');
        }
    );
};
