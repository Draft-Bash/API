exports.up = function (knex) {
return knex.schema.createTable('user_account', function (table) {
        table.increments('user_id').primary();
        table.string('username').unique().notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
    });
};
  
exports.down = function (knex) {
    return knex.schema.dropTable('user_account');
};
