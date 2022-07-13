/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(
        'ConfiguracionDictado_CelulaRitmica',
        (table) => {
            table.increments();
            table.integer('ConfiguracionDictadoId').unsigned().notNullable().index();
            table
                .foreign('ConfiguracionDictadoId')
                .references('ConfiguracionDictado.id')
                .withKeyName('fk_condic_cr_condic');
            table.integer('CelulaRitmicaId').unsigned().notNullable();
            table
                .foreign('CelulaRitmicaId')
                .references('CelulaRitmica.id')
                .withKeyName('fk_condic_cr_cr');
            table.timestamps(true, true);
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionDictado_CelulaRitmica');
};
