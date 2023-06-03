/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('Calificacion', (table) => {
        table.integer('DictadoArmonicoId').unsigned();
        table
            .foreign('DictadoArmonicoId')
            .references('DictadoArmonico.id')
            .withKeyName('fk_calificacion_dictado_armonico');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('Calificacion', (table) => {
        table.dropColumn('DictadoArmonicoId');
    });
};
