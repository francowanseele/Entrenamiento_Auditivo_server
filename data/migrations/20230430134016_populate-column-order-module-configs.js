/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex('Modulo').whereNull('Orden').update({ Orden: 9999 });

    await knex('ConfiguracionDictado').whereNull('Orden').update({ Orden: 9999 });

    await knex('ConfiguracionAcordeJazz').whereNull('Orden').update({ Orden: 9999 });
    
    await knex('ConfiguracionIntervalo').whereNull('Orden').update({ Orden: 9999 });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
