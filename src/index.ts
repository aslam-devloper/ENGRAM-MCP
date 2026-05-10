#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { homedir } from 'os';
import { createServer } from './server.js';
import { ensureCortexHome } from './utils/paths.js';
import { printBanner } from './utils/personality.js';

async function main(): Promise<void> {
  printBanner();
  await ensureCortexHome();

  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  process.stderr.write('🧠 CORTEX is online. Your AI finally has a memory.\n');
  process.stderr.write(`📂 Storage: ${process.env['ENGRAM_HOME'] ?? homedir() + '/.engram'}\n`);
}

main().catch((err: unknown) => {
  process.stderr.write(`💀 CORTEX crashed harder than your last deployment:\n${String(err)}\n`);
  process.exit(1);
});
