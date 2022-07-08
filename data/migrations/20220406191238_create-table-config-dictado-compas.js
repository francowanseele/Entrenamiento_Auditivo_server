/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ConfiguracionDictado_Compas', (table) => {
        table.increments();
        table.integer('ConfiguracionDictadoId').unsigned().notNullable().index();
        table
            .foreign('ConfiguracionDictadoId')
            .references('ConfiguracionDictado.id');
        table.integer('CompasId').unsigned().notNullable();
        table.foreign('CompasId').references('Compas.id');
        table.integer('Prioridad').notNullable();
        table.boolean('Simple').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionDictado_Compas');
};
