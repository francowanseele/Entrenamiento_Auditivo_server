/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw(
        'ALTER TABLE "' +
            'CelulaRitmica_Figura' +
            '" ALTER COLUMN "' +
            'Figura' +
            '" TYPE ' +
            'character varying(100)' +
            ''
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.raw(
        'ALTER TABLE "' +
            'CelulaRitmica_Figura' +
            '" ALTER COLUMN "' +
            'Figura' +
            '" TYPE ' +
            'integer' +
            ''
    );
};
