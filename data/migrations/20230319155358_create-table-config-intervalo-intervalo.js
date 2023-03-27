/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ConfiguracionIntervalo_Intervalo', (table) => {
        table.increments();

        table.integer('ConfiguracionIntervaloId').unsigned().notNullable().index();
        table
            .foreign('ConfiguracionIntervaloId')
            .references('ConfiguracionIntervalo.id')
            .withKeyName('fk_config_interv_config_interv_interv');

        table.string('Intervalo', 20);
        table.integer('Prioridad').notNullable();

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionIntervalo_Intervalo');
};
