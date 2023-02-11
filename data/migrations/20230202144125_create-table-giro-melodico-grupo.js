/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('GiroMelodico_Grupo', (table) => {
        table.increments();
        table.string('Nombre', 100);
        table.integer('Nivel').notNullable();
        table.integer('SubGrupoId').unsigned();
        table
            .foreign('SubGrupoId')
            .references('GiroMelodico_Grupo.id')
            .withKeyName('fk_gm_grupo_gm_grupo');
        table.integer('created_by');
        table
            .foreign('created_by')
            .references('Usuario.id')
            .withKeyName('fk_usr_gm_grupo');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('GiroMelodico_Grupo');
};
