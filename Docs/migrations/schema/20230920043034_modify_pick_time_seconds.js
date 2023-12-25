exports.up = function (knex) {
    return knex.schema.alterTable('draft', function (table) {
      table.smallint('pick_time_seconds').defaultTo(90).alter();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('draft', function (table) {
      table.integer('pick_time_seconds').defaultTo(90).alter();
    });
  };
