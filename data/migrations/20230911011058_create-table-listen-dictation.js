/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ListenDictation', (table) => {
        table.increments();

        table.integer('UsuarioId').unsigned().notNullable().index();
        table
            .foreign('UsuarioId')
            .references('Usuario.id')
            .withKeyName('fk_listen_dictation_usr');

        table.integer('DictadoId').unsigned().index();
        table
            .foreign('DictadoId')
            .references('Dictado.id')
            .withKeyName('fk_listen_dictation_dictado');

        table.integer('DictadoArmonicoId').unsigned().index();
        table
            .foreign('DictadoArmonicoId')
            .references('DictadoArmonico.id')
            .withKeyName('fk_listen_dictation_dictado_armonico');

        table.integer('AcordeJazzId').unsigned().index();
        table
            .foreign('AcordeJazzId')
            .references('AcordeJazz.id')
            .withKeyName('fk_listen_dictation_acorde_jazz');

        table.integer('IntervaloId').unsigned().index();
        table
            .foreign('IntervaloId')
            .references('Intervalo.id')
            .withKeyName('fk_listen_dictation_intervalo');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ListenDictation');
};
