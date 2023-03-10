/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(
        'ConfiguracionAcordeJazz_Tonalidad',
        (table) => {
            table.increments();
            table.string('Tonalidad', 10);
            table.integer('Prioridad');

            table
                .integer('ConfiguracionAcordeJazzId')
                .unsigned()
                .notNullable()
                .index();
            table
                .foreign('ConfiguracionAcordeJazzId')
                .references('ConfiguracionAcordeJazz.id')
                .withKeyName('fk_caj_tonalidad_caj');

            table.timestamps(true, true);
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionAcordeJazz_Tonalidad');
};
