/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable(
        'ConfiguracionDictado_GiroMelodico',
        (table) => {
            table.boolean('LecturaAmbasDirecciones');
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
            table.dropColumn('LecturaAmbasDirecciones');
        }
    );
};
