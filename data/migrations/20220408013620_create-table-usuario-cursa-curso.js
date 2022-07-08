/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('UsuarioCursa_Curso', (table) => {
        table.increments();
        table.integer('CursoId').unsigned().notNullable().index();
        table.foreign('CursoId').references('Curso.id');
        table.integer('UsuarioId').unsigned().notNullable().index();
        table.foreign('UsuarioId').references('Usuario.id');
        table.dateTime('FechaInscripcion').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('UsuarioCursa_Curso');
};
