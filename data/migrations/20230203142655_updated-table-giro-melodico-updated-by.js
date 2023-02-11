/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('GiroMelodico', (table) => {
        table.integer('updated_by');
        table
            .foreign('updated_by')
            .references('Usuario.id')
            .withKeyName('fk_usr_gm_updated');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('GiroMelodico', (table) => {
        table.dropColumn('updated_by');
    });
};
