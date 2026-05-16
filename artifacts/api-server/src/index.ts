import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

// Disable all Node.js-level socket/request timeouts so long-running
// SSE streams are not cut by the runtime. The platform (Replit / Cloud Run)
// request-timeout setting is the only enforced limit above this layer.
server.setTimeout(0);          // no socket inactivity timeout
server.requestTimeout = 0;     // no request-receive timeout (Node ≥ 14.11)
server.headersTimeout = 0;     // no headers timeout
server.keepAliveTimeout = 620_000; // > Cloud Run LB keepalive (600 s)
