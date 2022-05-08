/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Curso', (table) => {
        table.increments();
        table.string('Nombre', 100);
        table.string('Descripcion', 300),
            table.boolean('Personal').notNullable(),
            table.integer('InstitutoId').notNullable(),
            table.foreign('InstitutoId').references('Instituto.id'),
            table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Curso');
};
