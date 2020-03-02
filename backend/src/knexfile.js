if (!process.env.PG_CONNECTION_STRING) {
  throw new Error("PG_CONNECTION_STRING not set in env");
}

module.exports = {
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING
};
