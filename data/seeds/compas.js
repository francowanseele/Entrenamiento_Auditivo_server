/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    const resCountQuery = await knex('Compas').count('*', { as: 'number' });

    if (resCountQuery[0].number == 0) {
        await knex('Compas').insert({ Nombre: '2/4', Simple: true });
        await knex('Compas').insert({ Nombre: '3/4', Simple: true });
        await knex('Compas').insert({ Nombre: '4/4', Simple: true });

        await knex('Compas').insert({ Nombre: '6/8', Simple: false });
        await knex('Compas').insert({ Nombre: '9/8', Simple: false });
        await knex('Compas').insert({ Nombre: '12/8', Simple: false });
    }
};
