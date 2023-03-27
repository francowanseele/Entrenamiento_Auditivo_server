/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Calificacion', (table) => {
        table.increments();
        table.integer('Nota');
        table.boolean('Correcto');

        table.integer('UsuarioId').unsigned().notNullable();
        table
            .foreign('UsuarioId')
            .references('Usuario.id')
            .withKeyName('fk_calificacion_usr');

        table.integer('DictadoId').unsigned();
        table
            .foreign('DictadoId')
            .references('Dictado.id')
            .withKeyName('fk_calificacion_dictado');

        table.integer('AcordeJazzid').unsigned();
        table
            .foreign('AcordeJazzid')
            .references('AcordeJazz.id')
            .withKeyName('fk_calificacion_acorde_jazz');

        table.integer('IntervaloId').unsigned();
        table
            .foreign('IntervaloId')
            .references('Intervalo.id')
            .withKeyName('fk_calificacion_intervalo');

        table.integer('ModuloId').unsigned().notNullable();
        table
            .foreign('ModuloId')
            .references('Modulo.id')
            .withKeyName('fk_calificacion_modulo');

        table.integer('CursoId').unsigned().notNullable();
        table
            .foreign('CursoId')
            .references('Curso.id')
            .withKeyName('fk_calificacion_curso');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Calificacion');
};
