/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('CelulaRitmica_Figura', (table) => {
        table.increments();
        table.integer('CelulaRitmicaId').unsigned().notNullable().index();
        table.foreign('CelulaRitmicaId').references('CelulaRitmica.id');
        table.integer('Figura').notNullable();
        table.integer('Orden').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('CelulaRitmica_Figura');
};
