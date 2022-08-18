/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('CelulaRitmica', (table) => {
        table.integer('created_by');
        table
            .foreign('created_by')
            .references('Usuario.id')
            .withKeyName('fk_usr_cr');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('CelulaRitmica', (table) => {
        table.dropColumn('created_by');
    });
};
