/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(
        'ConfiguracionDictado_GiroMelodico',
        (table) => {
            table.increments();
            table.integer('ConfiguracionDictadoId').notNullable().index();
            table
                .foreign('ConfiguracionDictadoId')
                .references('ConfiguracionDictado.id');
            table.integer('GiroMelodicoId').notNullable().index();
            table.foreign('GiroMelodicoId').references('GiroMelodico.id');
            table.timestamps(true, true);
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionDictado_GiroMelodico');
};
