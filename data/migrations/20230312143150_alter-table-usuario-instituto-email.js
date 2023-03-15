/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('Usuario_Instituto', (table) => {
        table.string('Email');
        table.boolean('EsDocente');
        table.dropColumn('UsuarioId')
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('Usuario_Instituto', (table) => {
        table.dropColumn('Email');
        table.dropColumn('EsDocente');
        table.integer('UsuarioId')
    });
};
