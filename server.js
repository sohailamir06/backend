const app = require("./app");
const connectDB = require("./config/db");
const config = require("./config/env");

let server;

async function startServer() {
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(`MediStock API running on port ${config.port}`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully.`);
  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  shutdown("unhandledRejection");
});

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
