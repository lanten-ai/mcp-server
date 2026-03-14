# @lanten-ai/mcp-server

An [MCP](https://modelcontextprotocol.io) server that connects AI assistants to the [Lanten](https://lanten.co) property management API. Use it with Claude, Cursor, Zed, or any MCP-compatible client to manage tenants, units, and work orders using natural language.

## Quick start

1. **Get an API key** — in your Lanten dashboard go to **Settings → Developers** and create a key.

2. **Add to your MCP client config:**

```json
{
  "mcpServers": {
    "lanten": {
      "command": "npx",
      "args": ["-y", "@lanten-ai/mcp-server"],
      "env": {
        "LANTEN_API_KEY": "lk_your_api_key_here"
      }
    }
  }
}
```

For **Claude Desktop** this file lives at:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

For **Claude Code** run: `claude mcp add lanten -e LANTEN_API_KEY=lk_your_key -- npx -y @lanten-ai/mcp-server`

3. **Restart your client** and start chatting:

> *"List all open work orders for Flat 4, 12 Oak Street"*
> *"Create a new tenant: Jane Smith, jane@example.com, assign her to unit abc-123"*
> *"Mark work order WO-214 as completed"*

---

## Available tools

### Tenants

| Tool | Description |
|---|---|
| `list_tenants` | List tenants with optional search and pagination |
| `get_tenant` | Get a single tenant by ID |
| `create_tenant` | Create a tenant, optionally linked to a unit |
| `update_tenant` | Update tenant fields (partial update) |
| `delete_tenant` | Permanently delete a tenant |

### Units

| Tool | Description |
|---|---|
| `list_units` | List property units with optional address search |
| `get_unit` | Get a single unit by ID |
| `create_unit` | Create a property unit |
| `update_unit` | Update unit fields (partial update) |
| `delete_unit` | Permanently delete a unit |

### Work Orders

| Tool | Description |
|---|---|
| `list_work_orders` | List work orders; filter by status, priority, tenant, or unit |
| `get_work_order` | Get a single work order by ID |
| `create_work_order` | Create a work order linked to a tenant/unit |
| `update_work_order` | Update a work order (status, priority, etc.) |
| `delete_work_order` | Permanently delete a work order |

**Priority levels:** `0` Emergency · `1` High · `2` Medium · `3` Low
**Statuses:** `reported` · `in_progress` · `completed` · `cancelled`

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `LANTEN_API_KEY` | ✅ | Your API key from Settings → Developers |
| `LANTEN_API_URL` | — | Override the base URL (e.g. for self-hosted instances). Defaults to `https://app.lanten.ai/api/open/v1` |

---

## Developing locally

```bash
git clone https://github.com/lanten/mcp-server
cd mcp-server
npm install
npm run build

# Test with the MCP Inspector
LANTEN_API_KEY=lk_your_key npm run inspector
```
