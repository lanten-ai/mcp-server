#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LantenClient } from './client.js';
import { registerTenantTools } from './tools/tenants.js';
import { registerUnitTools } from './tools/units.js';
import { registerWorkOrderTools } from './tools/work-orders.js';

const apiKey = process.env.LANTEN_API_KEY;
if (!apiKey) {
  console.error('Error: LANTEN_API_KEY environment variable is required.');
  console.error('Get an API key from your Lanten dashboard: Settings → Developers');
  process.exit(1);
}

const baseUrl =
  (process.env.LANTEN_API_URL ?? 'https://app.lanten.ai/api/open/v1').replace(/\/$/, '');

const client = new LantenClient(baseUrl, apiKey);

const server = new McpServer({
  name: 'lanten',
  version: '0.1.0',
});

registerTenantTools(server, client);
registerUnitTools(server, client);
registerWorkOrderTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
