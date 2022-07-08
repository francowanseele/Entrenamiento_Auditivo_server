/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Usuario_Instituto', (table) => {
        table.increments();
        table.integer('UsuarioId').unsigned().notNullable().index();
        table.foreign('UsuarioId').references('Usuario.id');
        table.integer('InstitutoId').unsigned().notNullable().index();
        table.foreign('InstitutoId').references('Instituto.id');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Usuario_Instituto');
};
