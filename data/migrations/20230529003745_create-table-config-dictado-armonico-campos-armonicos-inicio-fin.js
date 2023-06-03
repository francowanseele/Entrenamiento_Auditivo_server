/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ConfiguracionDictadoArmonico_CampoArmonicoFin', (table) => {
        table.increments();
        table.string('Escala', 30);
        table.string('KeyNote', 3);
        table.string('NombreCifrado', 30);
        table.string('Tension', 100);
        table.integer('Tipo');

        table
            .integer('ConfiguracionDictadoArmonicoId')
            .unsigned()
            .notNullable()
            .index();
        table
            .foreign('ConfiguracionDictadoArmonicoId')
            .references('ConfiguracionDictadoArmonico.id')
            .withKeyName('fk_cda_ca_cda');

        table.integer('EscalaPrioridad').notNullable();
        table.integer('KeyNotePrioridad').notNullable();
        table.string('EstadosAcorde');

        table.timestamps(true, true);   
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('ConfiguracionDictadoArmonico_CampoArmonicoFin');
};
