/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable(
        'ConfiguracionDictadoArmonico_Tonalidad',
        (table) => {
            table.increments();
            table.string('Tonalidad', 10);
            table.integer('Prioridad');

            table
                .integer('ConfiguracionDictadoArmonicoId')
                .unsigned()
                .notNullable()
                .index();
            table
                .foreign('ConfiguracionDictadoArmonicoId')
                .references('ConfiguracionDictadoArmonico.id')
                .withKeyName('fk_cda_tonalidad_cda');

            table.timestamps(true, true);
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('ConfiguracionDictadoArmonico_Tonalidad');
};
