import Knex from "knex";

export async function up(knex : Knex) {
    return knex.schema.createTable('pontosColeta', table => {
        table.increments('id').primary();
        table.string('imagem').notNullable();
        table.string('nome').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.decimal('latitude').notNullable();
        table.decimal('longitude').notNullable();
        table.string('uf', 2).notNullable();
        table.string('cidade').notNullable();

    });
}

export async function down(knex : Knex) {
    return knex.schema.dropTable('pontosColeta');
}