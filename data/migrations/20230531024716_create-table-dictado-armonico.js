/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('DictadoArmonico', (table) => {
        table.increments();
        table.string('Tonalidad', 10);
        table.string('AcordeReferencia', 500);

        table
            .integer('CreadorUsuarioId')
            .unsigned()
            .notNullable()
            .index();
        table
            .foreign('CreadorUsuarioId')
            .references('Usuario.id')
            .withKeyName('fk_dictado_armonico_usr');

        table
            .integer('ConfiguracionDictadoArmonicoId')
            .unsigned()
            .notNullable()
            .index();
        table
            .foreign('ConfiguracionDictadoArmonicoId')
            .references('ConfiguracionDictadoArmonico.id')
            .withKeyName('fk_dictado_armonico_cda_id');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('DictadoArmonico');
};
