/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ConfiguracionDictado_Ligadura', (table) => {
        table.increments();
        table.integer('ConfiguracionDictadoId').notNullable().index();
        table
            .foreign('ConfiguracionDictadoId')
            .references('ConfiguracionDictado.id');
        table.integer('FirstCelulaRitmicaId').notNullable().index();
        table.foreign('FirstCelulaRitmicaId').references('CelulaRitmica.id');
        table.integer('SecondCelulaRitmicaId').notNullable().index();
        table.foreign('SecondCelulaRitmicaId').references('CelulaRitmica.id');
        table.integer('Prioridad');
        table.boolean('Must').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionDictado_Ligadura');
};
