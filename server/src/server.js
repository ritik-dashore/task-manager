require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/db');

const port = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDatabase();
    const server = app.listen(port, () => console.log(`Task Manager API listening on port ${port}.`));
    const shutdown = signal => {
      console.log(`${signal} received; closing API server.`);
      server.close(() => {
        require('mongoose').connection.close(false).finally(() => process.exit(0));
      });
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error(`Unable to start API: ${error.message}`);
    process.exitCode = 1;
  }
}

start();
