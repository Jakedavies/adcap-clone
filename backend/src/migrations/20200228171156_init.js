exports.up = function(knex) {
  return knex.schema.createTable("users", table => {
    table.increments("id");
    table.string("device_id");
    table.text("state");
  });
};

exports.down = function(knex) {};
