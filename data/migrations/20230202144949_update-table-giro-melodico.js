/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('GiroMelodico', (table) => {
        table.integer('GrupoId').unsigned().index();
        table
            .foreign('GrupoId')
            .references('GiroMelodico_Grupo.id')
            .withKeyName('fk_gm_gm_grupo');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('GiroMelodico', (table) => {
        table.dropColumn('GrupoId');
    });
};
