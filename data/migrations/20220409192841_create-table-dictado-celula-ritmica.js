/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Dictado_CelulaRitmica', (table) => {
        table.increments();
        table.integer('Orden').notNullable();
        table.integer('CelulaRitmicaId').notNullable();
        table.foreign('CelulaRitmicaId').references('CelulaRitmica.id');
        table.integer('DictadoId').notNullable().index();
        table.foreign('DictadoId').references('Dictado.id');
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
