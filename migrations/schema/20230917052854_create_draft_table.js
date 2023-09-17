exports.up = function (knex) {
    return knex.schema.createTable('draft', function (table) {
      table.increments('draft_id').primary();
      table.string('draft_type').defaultTo('snake');
      table.string('scoring_type').defaultTo('points');
      table.string('pick_time_seconds').defaultTo('90');
      table.smallint('team_count').defaultTo(10);
      table.smallint('pointguard_slots').defaultTo(1);
      table.smallint('shootingguard_slots').defaultTo(1);
      table.smallint('guard_slots').defaultTo(1);
      table.smallint('smallforward_slots').defaultTo(1);
      table.smallint('powerforward_slots').defaultTo(1);
      table.smallint('forward_slots').defaultTo(1);
      table.smallint('center_slots').defaultTo(1);
      table.smallint('utility_slots').defaultTo(3);
      table.smallint('bench_slots').defaultTo(4);
      table.integer('scheduled_by_user_id').references('user_id').inTable('user_account').onDelete('CASCADE');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('draft');
  };