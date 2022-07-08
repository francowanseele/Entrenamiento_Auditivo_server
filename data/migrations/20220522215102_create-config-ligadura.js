/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ConfiguracionDictado_Ligadura', (table) => {
        table.increments();
        table.integer('ConfiguracionDictadoId').unsigned().notNullable().index();
        table
            .foreign('ConfiguracionDictadoId')
            .references('ConfiguracionDictado.id')
            .withKeyName('fk_condiclig_condic');
        table.integer('FirstCelulaRitmicaId').unsigned().notNullable().index();
        table
            .foreign('FirstCelulaRitmicaId')
            .references('CelulaRitmica.id')
            .withKeyName('fk_condiclig_fircr');
        table.integer('SecondCelulaRitmicaId').unsigned().notNullable().index();
        table
            .foreign('SecondCelulaRitmicaId')
            .references('CelulaRitmica.id')
            .withKeyName('fk_condiclig_seccr');
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
