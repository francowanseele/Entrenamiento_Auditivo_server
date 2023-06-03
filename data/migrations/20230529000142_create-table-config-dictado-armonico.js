/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ConfiguracionDictadoArmonico', (table) => {
        table.increments();
        table.string('Nombre', 100);
        table.string('Descripcion', 300);

        table.integer('CreadorUsuarioId').unsigned().notNullable().index();
        table
            .foreign('CreadorUsuarioId')
            .references('Usuario.id')
            .withKeyName('fk_configdictadoarmonico_usr_creator');

        table.integer('ModuloId').unsigned().notNullable().index();
        table
            .foreign('ModuloId')
            .references('Modulo.id')
            .withKeyName('fk_configdictadoarmonico_modulo');

        table.boolean('Eliminado');
        table.integer('Orden');
        table.integer('Largo');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionDictadoArmonico');
};
