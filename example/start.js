#!/usr/bin/env node

const { runServer } = require('metro');
const path = require('path');
const { loadConfig } = require('metro-config');

(async () => {
  const config = await loadConfig({
    cwd: __dirname,
    config: path.join(__dirname, 'metro.config.js'),
  });

  // Ensure port is defined
  config.server = {
    ...config.server,
    port: 8081,
    enhanceMiddleware: (middleware) => middleware, // prevent 'handle' error
  };

  await runServer(config);
})();
