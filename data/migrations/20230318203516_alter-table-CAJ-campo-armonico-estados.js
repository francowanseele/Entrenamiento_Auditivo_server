/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable(
        'ConfiguracionAcordeJazz_CampoArmonico',
        (table) => {
            table.string('EstadosAcorde');
        }
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable(
        'ConfiguracionAcordeJazz_CampoArmonico',
        (table) => {
            table.dropColumn('EstadosAcorde');
        }
    );
};
