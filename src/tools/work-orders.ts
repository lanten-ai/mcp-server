import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { LantenClient } from '../client.js';

const STATUS = z
  .enum(['reported', 'in_progress', 'completed', 'cancelled'])
  .describe('Work order status');

const PRIORITY = z
  .enum(['0', '1', '2', '3'])
  .describe('Priority: 0 = Emergency, 1 = High, 2 = Medium, 3 = Low');

export function registerWorkOrderTools(server: McpServer, client: LantenClient): void {
  // ── List ────────────────────────────────────────────────────────────────────
  server.registerTool(
    'list_work_orders',
    {
      description:
        'List work orders (maintenance issues) for the account. Filter by status, priority, tenant, or unit. Supports search by title or code.',
      inputSchema: {
        search: z.string().optional().describe('Search by title or work order code (e.g. WO-101)'),
        status: STATUS.optional(),
        priority: PRIORITY.optional(),
        tenantId: z.string().uuid().optional().describe('Filter by tenant UUID'),
        unitId: z.string().uuid().optional().describe('Filter by unit UUID'),
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
    async ({ search, status, priority, tenantId, unitId, page, pageSize }) => {
      try {
        const result = await client.request('GET', '/work-orders', {
          query: { search, status, priority, tenantId, unitId, page, pageSize },
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
    'get_work_order',
    {
      description: 'Get a single work order by ID, including tenant, unit, and attachments.',
      inputSchema: {
        id: z.string().uuid().describe('Work order UUID'),
      },
    },
    async ({ id }) => {
      try {
        const result = await client.request('GET', `/work-orders/${id}`);
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
    'create_work_order',
    {
      description:
        'Create a new work order (maintenance issue). Optionally link to a tenant and/or unit.',
      inputSchema: {
        title: z.string().min(1).max(260).describe('Short title describing the issue'),
        description: z.string().min(1).describe('Full description of the issue'),
        priority: PRIORITY.optional().default('2'),
        tenantId: z.string().uuid().optional().describe('UUID of the tenant who reported it'),
        unitId: z.string().uuid().optional().describe('UUID of the property unit affected'),
        availability: z
          .string()
          .max(260)
          .optional()
          .describe("Free-text tenant availability window (e.g. 'weekday mornings')"),
      },
    },
    async ({ title, description, priority, tenantId, unitId, availability }) => {
      try {
        const result = await client.request('POST', '/work-orders', {
          body: { title, description, priority, tenantId, unitId, availability },
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
    'update_work_order',
    {
      description:
        'Update an existing work order. Only supplied fields are changed. Setting status to "completed" automatically records the resolved time.',
      inputSchema: {
        id: z.string().uuid().describe('Work order UUID'),
        title: z.string().min(1).max(260).optional().describe('Updated title'),
        description: z.string().min(1).optional().describe('Updated description'),
        status: STATUS.optional(),
        priority: PRIORITY.optional(),
        tenantId: z
          .string()
          .uuid()
          .nullable()
          .optional()
          .describe('Updated tenant UUID (null to unlink)'),
        unitId: z
          .string()
          .uuid()
          .nullable()
          .optional()
          .describe('Updated unit UUID (null to unlink)'),
        availability: z.string().max(260).optional().describe('Updated availability window'),
      },
    },
    async ({ id, ...fields }) => {
      try {
        const result = await client.request('PUT', `/work-orders/${id}`, { body: fields });
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
    'delete_work_order',
    {
      description: 'Permanently delete a work order. This cannot be undone.',
      inputSchema: {
        id: z.string().uuid().describe('Work order UUID'),
      },
    },
    async ({ id }) => {
      try {
        const result = await client.request('DELETE', `/work-orders/${id}`);
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
