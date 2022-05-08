/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    const resCountQuery = await knex('Tesitura').count('*', { as: 'number' });

    if (resCountQuery[0].number == 0) {
        await knex('Tesitura').insert({
            Clave: 'Sol',
            ByDefault: true,
            NotaMenor: 'G3',
            NotaMayor: 'D6',
        });

        await knex('Tesitura').insert({
            Clave: 'Fa',
            ByDefault: true,
            NotaMenor: 'B1',
            NotaMayor: 'F4',
        });
    }
};
