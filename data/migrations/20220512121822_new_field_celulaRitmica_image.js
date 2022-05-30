/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function (knex) {
    return knex.schema.alterTable('CelulaRitmica', (table) => {
        table.text('Imagen');
        table.string('Valor').alter()
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('CelulaRitmica', (table) => {
        table.dropColumn('Imagen');
    });
};
