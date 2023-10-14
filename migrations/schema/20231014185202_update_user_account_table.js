exports.up = function (knex) {
    return knex.schema.alterTable('user_account', function (table) {
        table.boolean('is_google_auth').defaultTo(false);
        table.dropUnique('email');
        table.string('email').notNullable().alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('user_account', function (table) {
        table.dropColumn('is_google_auth');
        table.string('email').unique().notNullable().alter();
    });
};