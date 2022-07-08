/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Usuario', (table) => {
        table.increments();
        table.string('Nombre', 100);
        table.string('Apellido', 100);
        table.string('Email', 250);
        table.string('Password', 300);
        table.boolean('EsDocente').notNullable();
        table.integer('CursoPersonalId').unsigned().notNullable();
        table.foreign('CursoPersonalId').references('Curso.id');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Usuario');
};
