/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ConfiguracionAcordeJazz_CampoArmonico', (table) => {
        table.increments();
        table.string('Escala', 30);
        table.string('KeyNote', 3);
        table.string('NombreCifrado', 30);
        table.string('Tension', 100);
        table.integer('Tipo');

        table.integer('ConfiguracionAcordeJazzId').unsigned().notNullable().index();
        table
            .foreign('ConfiguracionAcordeJazzId')
            .references('ConfiguracionAcordeJazz.id')
            .withKeyName('fk_caj_ca_caj');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionAcordeJazz_CampoArmonico');
};
