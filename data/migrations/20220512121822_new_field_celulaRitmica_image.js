/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function (knex) {
    return knex.schema.alterTable('CelulaRitmica', (table) => {
        table.binary('image');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('CelulaRitmica', (table) => {
        table.dropColumn('image');
    });
};
