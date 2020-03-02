import fastify from "fastify";
import fastifyCors from "fastify-cors";

import indexRoute from "./routes/index.route";
import dbConnector from "./lib/plugins/db";
import knexConfig from "./knexfile";

function createServer() {
  const server = fastify({ logger: { prettyPrint: true } });

  server.register(indexRoute);
  server.register(dbConnector, knexConfig);
  server.register(fastifyCors, { origin: true });

  server.setErrorHandler((error, req, res) => {
    req.log.error(error.toString());
    res.send({ error });
  });

  return server;
}

export default createServer;
