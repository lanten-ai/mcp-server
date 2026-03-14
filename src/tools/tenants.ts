import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { LantenClient } from '../client.js';

export function registerTenantTools(server: McpServer, client: LantenClient): void {
  // ── List ────────────────────────────────────────────────────────────────────
  server.registerTool(
    'list_tenants',
    {
      description:
        'List tenants for the account. Supports free-text search across name, email, phone, and unit address. Returns paginated results.',
      inputSchema: {
        search: z.string().optional().describe('Search across name, email, phone, unit address'),
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
        const result = await client.request('GET', '/tenants', {
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
    'get_tenant',
    {
      description: 'Get a single tenant by ID, including their linked units.',
      inputSchema: {
        id: z.string().uuid().describe('Tenant UUID'),
      },
    },
    async ({ id }) => {
      try {
        const result = await client.request('GET', `/tenants/${id}`);
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
    'create_tenant',
    {
      description: 'Create a new tenant. Optionally assign them to an existing unit.',
      inputSchema: {
        firstName: z.string().min(1).max(160).describe('First name'),
        lastName: z.string().min(1).max(160).describe('Last name'),
        email: z.string().email().optional().describe('Email address'),
        phoneNumber: z.string().optional().describe('Phone number'),
        notes: z.string().optional().describe('Internal notes'),
        unitId: z
          .string()
          .uuid()
          .optional()
          .describe('UUID of an existing unit to assign this tenant to'),
      },
    },
    async ({ firstName, lastName, email, phoneNumber, notes, unitId }) => {
      try {
        const result = await client.request('POST', '/tenants', {
          body: { firstName, lastName, email, phoneNumber, notes, unitId },
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
    'update_tenant',
    {
      description: 'Update an existing tenant. Only supplied fields are changed.',
      inputSchema: {
        id: z.string().uuid().describe('Tenant UUID'),
        firstName: z.string().min(1).max(160).optional().describe('Updated first name'),
        lastName: z.string().min(1).max(160).optional().describe('Updated last name'),
        email: z.string().email().nullable().optional().describe('Updated email (null to clear)'),
        phoneNumber: z
          .string()
          .nullable()
          .optional()
          .describe('Updated phone number (null to clear)'),
        notes: z.string().nullable().optional().describe('Updated notes (null to clear)'),
      },
    },
    async ({ id, ...fields }) => {
      try {
        const result = await client.request('PUT', `/tenants/${id}`, { body: fields });
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
    'delete_tenant',
    {
      description: 'Permanently delete a tenant. This cannot be undone.',
      inputSchema: {
        id: z.string().uuid().describe('Tenant UUID'),
      },
    },
    async ({ id }) => {
      try {
        const result = await client.request('DELETE', `/tenants/${id}`);
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
