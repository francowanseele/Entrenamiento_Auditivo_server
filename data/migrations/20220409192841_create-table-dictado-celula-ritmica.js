/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Dictado_CelulaRitmica', (table) => {
        table.increments();
        table.integer('Orden').notNullable();
        table.integer('CelulaRitmicaId').unsigned().notNullable();
        table
            .foreign('CelulaRitmicaId')
            .references('CelulaRitmica.id')
            .withKeyName('fk_diccr_cr');
        table.integer('DictadoId').unsigned().notNullable().index();
        table
            .foreign('DictadoId')
            .references('Dictado.id')
            .withKeyName('fk_diccr_dic');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Dictado_CelulaRitmica');
};
