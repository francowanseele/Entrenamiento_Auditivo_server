/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Dictado_Calificacion', (table) => {
        table.increments();
        table.integer('Calificacion');
        table.string('TipoError', 50);
        table.integer('DictadoId').unsigned().notNullable().index();
        table
            .foreign('DictadoId')
            .references('Dictado.id')
            .withKeyName('fk_diccalif_dic');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Dictado_Calificacion');
};
