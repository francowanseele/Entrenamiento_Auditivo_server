/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(
        'ConfiguracionDictado_Tonalidad',
        (table) => {
            table.increments();
            table.integer('ConfiguracionDictadoId').unsigned().notNullable().index();
            table
                .foreign('ConfiguracionDictadoId')
                .references('ConfiguracionDictado.id');
            table.string('Tonalidad', 10);
            table.integer('Prioridad').notNullable();
            table.timestamps(true, true);
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionDictado_Tonalidad');
};
