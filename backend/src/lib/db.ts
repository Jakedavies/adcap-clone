import knex from "knex";
import fastifyPlugin from "fastify-plugin";

const c = async function dbConnection(fastify, options) {
  const k = knex(options);
  fastify.decorate("knex", k);
};

export default fastifyPlugin(c);
