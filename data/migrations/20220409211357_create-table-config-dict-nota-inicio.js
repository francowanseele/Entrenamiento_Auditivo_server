/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(
        'ConfiguracionDictado_NotaInicio',
        (table) => {
            table.increments();
            table.string('Nota', 10);
            table.integer('ConfiguracionDictadoId').unsigned().notNullable().index();
            table
                .foreign('ConfiguracionDictadoId')
                .references('ConfiguracionDictado.id')
                .withKeyName('fk_condicnotini_condic');
            table.timestamps(true, true);
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionDictado_NotaInicio');
};
