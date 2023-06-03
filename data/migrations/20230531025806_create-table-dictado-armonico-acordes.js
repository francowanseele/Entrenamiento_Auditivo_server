/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('DictadoArmonico_Acorde', (table) => {
        table.increments();
        table.string('Nombre', 250);
        table.string('Notas', 500);
        table.integer('Tipo').notNullable();
        table.integer('Orden').notNullable();

        table
            .integer('DictadoArmonicoId')
            .unsigned()
            .notNullable()
            .index();
        table
            .foreign('DictadoArmonicoId')
            .references('DictadoArmonico.id')
            .withKeyName('fk_dictado_armonico_dictado_armonico_acorde');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('DictadoArmonico_Acorde');
};
