/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ConfiguracionIntervalo', (table) => {
        table.increments();
        table.string('Nombre', 100);
        table.string('Descripcion', 300);

        table.integer('CreadorUsuarioId').unsigned().notNullable().index();
        table
            .foreign('CreadorUsuarioId')
            .references('Usuario.id')
            .withKeyName('fk_config_intervalo_usr_creator');

        table.integer('ModuloId').unsigned().notNullable().index();
        table
            .foreign('ModuloId')
            .references('Modulo.id')
            .withKeyName('fk_config_intervalo_modulo');

        table.integer('PrioridadClaveSol').notNullable();
        table.integer('PrioridadClaveFa').notNullable();
        table.integer('Direccion').notNullable();
        table.integer('Tipo').notNullable();

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionIntervalo');
};
