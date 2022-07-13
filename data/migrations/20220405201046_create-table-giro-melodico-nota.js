/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('GiroMelodico_Nota', (table) => {
        table.increments();
        table.integer('GiroMelodicoId').unsigned().notNullable().index();
        table.foreign('GiroMelodicoId').references('GiroMelodico.id');
        table.string('Nota', 10);
        table.integer('Orden').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('GiroMelodico_Nota');
};
