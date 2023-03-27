/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Intervalo', (table) => {
        table.increments();
        table.string('Notas', 30);
        table.string('NotaReferencia', 10);
        table.integer('Tipo').notNullable();
        table.integer('Direccion').notNullable();
        table.string('Clave', 10);
        table.string('Intervalo', 10);

        table
            .integer('CreadorUsuarioId')
            .unsigned()
            .notNullable()
            .index();
        table
            .foreign('CreadorUsuarioId')
            .references('Usuario.id')
            .withKeyName('fk_usr_intervalo');

        table
            .integer('ConfiguracionIntervaloId')
            .unsigned()
            .notNullable()
            .index();
        table
            .foreign('ConfiguracionIntervaloId')
            .references('ConfiguracionIntervalo.id')
            .withKeyName('fk_intervalo_conf_intervalo');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Intervalo');
};
