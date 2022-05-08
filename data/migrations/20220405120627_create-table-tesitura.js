/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Tesitura', (table) => {
        table.increments();
        table.string('Clave', 10);
        table.boolean('ByDefault');
        table.string('NotaMenor', 10);
        table.string('NotaMayor', 10);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('Tesitura');
};
