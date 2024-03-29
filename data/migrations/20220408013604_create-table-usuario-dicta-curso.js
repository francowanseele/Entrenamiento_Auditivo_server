/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('UsuarioDicta_Curso', (table) => {
        table.increments();
        table.integer('CursoId').unsigned().notNullable().index();
        table.foreign('CursoId').references('Curso.id').withKeyName('fk_usrdict_cur');
        table.integer('UsuarioId').unsigned().notNullable().index();
        table
            .foreign('UsuarioId')
            .references('Usuario.id')
            .withKeyName('fk_usrdict_usr');
        table.boolean('Responsable').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('UsuarioDicta_Curso');
};
