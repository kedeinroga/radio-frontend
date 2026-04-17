'use strict';
// Reads /run/secrets/app.json (mounted by Cloud Run from Secret Manager)
// and exports each key as process.env before starting the Next.js server.
// If the file is absent (local dev), the process starts with existing env vars.
const fs = require('fs');
const secretsPath = '/run/secrets/app.json';
if (fs.existsSync(secretsPath)) {
  const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
  Object.entries(secrets).forEach(([k, v]) => { process.env[k] = v; });
}
require('./apps/next/server.js');
