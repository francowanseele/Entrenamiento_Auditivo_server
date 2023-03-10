/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('AcordeJazz', (table) => {
        table.increments();
        table.string('Nombre', 250);
        table.string('Notas', 500);
        table.string('Tonalidad', 10);
        table.integer('Tipo').notNullable();
        table.string('NotaReferencia', 10);

        table
            .integer('CreadorUsuarioId')
            .unsigned()
            .notNullable()
            .index();
        table
            .foreign('CreadorUsuarioId')
            .references('Usuario.id')
            .withKeyName('fk_acorde_jazz_usr');

        table
            .integer('ConfiguracionAcordeJazzId')
            .unsigned()
            .notNullable()
            .index();
        table
            .foreign('ConfiguracionAcordeJazzId')
            .references('ConfiguracionAcordeJazz.id')
            .withKeyName('fk_acorde_jazz_caj');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('AcordeJazz');
};
