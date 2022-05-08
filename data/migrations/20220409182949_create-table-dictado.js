/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Dictado', (table) => {
        table.increments();
        table.string('NotaReferencia', 10);
        table.string('Tonalidad', 10);
        table.string('Clave', 10);
        table.integer('CompasId').notNullable();
        table.foreign('CompasId').references('Compas.id');
        table.integer('Bpm').notNullable();
        table.boolean('DictadoRitmico').notNullable();
        table.integer('CreadorUsuarioId').notNullable().index();
        table.foreign('CreadorUsuarioId').references('Usuario.id');
        table.integer('ConfiguracionDictadoId').notNullable();
        table
            .foreign('ConfiguracionDictadoId')
            .references('ConfiguracionDictado.id');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Dictado');
};
