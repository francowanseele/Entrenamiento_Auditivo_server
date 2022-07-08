/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('ConfiguracionDictado', (table) => {
        table.increments();
        table.string('Nombre', 100);
        table.string('Descripcion', 300);
        table.integer('NumeroCompases').notNullable();
        table.boolean('Simple').notNullable();
        table.string('NotaReferencia', 10);
        table.integer('BpmMenor').notNullable();
        table.integer('BpmMayor').notNullable();
        table.boolean('DictadoRitmico').notNullable();
        table.integer('PrioridadClaveSol').notNullable();
        table.integer('PrioridadClaveFa').notNullable();
        table.integer('TesituraClaveSolId').unsigned().notNullable();
        table.foreign('TesituraClaveSolId').references('Tesitura.id');
        table.integer('TesituraClaveFaId').unsigned().notNullable();
        table.foreign('TesituraClaveFaId').references('Tesitura.id');
        table.integer('ModuloId').unsigned().notNullable();
        table.foreign('ModuloId').references('Modulo.id');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('ConfiguracionDictado');
};
