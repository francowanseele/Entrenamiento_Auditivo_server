/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Dictado_Nota', (table) => {
        table.increments();
        table.string('Nota', 10);
        table.integer('DictadoId').notNullable().index();
        table.foreign('DictadoId').references('Dictado.id');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Dictado_Nota');
};
