exports.up = function (knex) {
    return knex.schema.createTable('draft_order', function (table) {
            table.increments('draft_order_id').primary();
            table.integer('user_id').references('user_id').inTable('user_account');
            table.integer('draft_id').notNullable().references('draft_id').inTable('draft').onDelete('CASCADE');
            table.smallint('bot_number');
            table.smallint('pick_number');
            table.boolean('is_picked').defaultTo(false);
        });
    };
      
    exports.down = function (knex) {
        return knex.schema.dropTable('draft_order');
    };
