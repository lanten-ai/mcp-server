import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { LantenClient } from '../client.js';

export function registerUnitTools(server: McpServer, client: LantenClient): void {
  // ── List ────────────────────────────────────────────────────────────────────
  server.registerTool(
    'list_units',
    {
      description:
        'List property units for the account. Supports address search. Returns paginated results including current tenants.',
      inputSchema: {
        search: z.string().optional().describe('Search by address'),
        page: z.number().int().min(1).optional().default(1).describe('Page number (default 1)'),
        pageSize: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .default(20)
          .describe('Results per page (max 50, default 20)'),
      },
    },
    async ({ search, page, pageSize }) => {
      try {
        const result = await client.request('GET', '/units', {
          query: { search, page, pageSize },
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    },
  );

  // ── Get ─────────────────────────────────────────────────────────────────────
  server.registerTool(
    'get_unit',
    {
      description: 'Get a single property unit by ID, including current tenants.',
      inputSchema: {
        id: z.string().uuid().describe('Unit UUID'),
      },
    },
    async ({ id }) => {
      try {
        const result = await client.request('GET', `/units/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    },
  );

  // ── Create ──────────────────────────────────────────────────────────────────
  server.registerTool(
    'create_unit',
    {
      description: 'Create a new property unit.',
      inputSchema: {
        addressLine1: z.string().min(1).max(260).describe('Street address line 1'),
        addressLine2: z
          .string()
          .max(260)
          .optional()
          .describe('Street address line 2 (flat number, etc.)'),
        city: z.string().min(1).max(160).describe('City or town'),
        county: z.string().max(160).optional().describe('County or province'),
        country: z.string().min(1).max(160).describe('Country'),
        postcode: z.string().min(1).max(80).describe('Postal / zip code'),
        area: z.string().max(160).optional().describe('Area or region label (e.g. "North Zone")'),
      },
    },
    async ({ addressLine1, addressLine2, city, county, country, postcode, area }) => {
      try {
        const result = await client.request('POST', '/units', {
          body: { addressLine1, addressLine2, city, county, country, postcode, area },
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    },
  );

  // ── Update ──────────────────────────────────────────────────────────────────
  server.registerTool(
    'update_unit',
    {
      description: 'Update an existing property unit. Only supplied fields are changed.',
      inputSchema: {
        id: z.string().uuid().describe('Unit UUID'),
        addressLine1: z.string().min(1).max(260).optional().describe('Updated street address'),
        addressLine2: z
          .string()
          .max(260)
          .nullable()
          .optional()
          .describe('Updated address line 2 (null to clear)'),
        city: z.string().min(1).max(160).optional().describe('Updated city'),
        county: z.string().max(160).optional().describe('Updated county'),
        country: z.string().min(1).max(160).optional().describe('Updated country'),
        postcode: z.string().min(1).max(80).optional().describe('Updated postcode'),
        area: z.string().max(160).nullable().optional().describe('Updated area (null to clear)'),
      },
    },
    async ({ id, ...fields }) => {
      try {
        const result = await client.request('PUT', `/units/${id}`, { body: fields });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    },
  );

  // ── Delete ──────────────────────────────────────────────────────────────────
  server.registerTool(
    'delete_unit',
    {
      description: 'Permanently delete a property unit. This cannot be undone.',
      inputSchema: {
        id: z.string().uuid().describe('Unit UUID'),
      },
    },
    async ({ id }) => {
      try {
        const result = await client.request('DELETE', `/units/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    },
  );
}
