/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Modulo', (table) => {
        table.increments();
        table.string('Nombre', 100);
        table.string('Descripcion', 300),
            table.integer('CursoId').unsigned().notNullable(),
            table.foreign('CursoId').references('Curso.id'),
            table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Modulo');
};
