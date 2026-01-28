// ✅ index.ts (ESM-compatible)
import { placeOrder, getHoldings, getPositions, getQuote, getMargins } from './trade/trade.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.token
dotenv.config({ path: path.resolve(process.cwd(), '.env.token') });

// Create the MCP server
const server = new McpServer({
  name: 'zerodha-trading-server',
  version: '1.0.0'
});

// Helper to format error responses
const formatError = (err: any) => ({
  content: [{
    type: 'text' as const,
    text: `❌ Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`
  }]
});

// --- ACCOUNT & MARKET DATA TOOLS ---

server.registerTool('get_holdings', {
  title: 'Get Holdings',
  description: 'Fetch current long-term stock holdings',
  inputSchema: {}
}, async () => {
  try {
    const holdings = await getHoldings();
    return {
      content: [{ type: 'text', text: JSON.stringify(holdings, null, 2) }]
    };
  } catch (err) {
    return formatError(err);
  }
});

server.registerTool('get_positions', {
  title: 'Get Positions',
  description: 'Fetch current day positions (intraday)',
  inputSchema: {}
}, async () => {
  try {
    const positions = await getPositions();
    return {
      content: [{ type: 'text', text: JSON.stringify(positions, null, 2) }]
    };
  } catch (err) {
    return formatError(err);
  }
});

server.registerTool('get_funds', {
  title: 'Get Funds',
  description: 'Fetch available margins/funds',
  inputSchema: {}
}, async () => {
  try {
    const margins = await getMargins();
    return {
      content: [{ type: 'text', text: JSON.stringify(margins, null, 2) }]
    };
  } catch (err) {
    return formatError(err);
  }
});

server.registerTool('get_quote', {
  title: 'Get Quote',
  description: 'Fetch live quote for instruments (e.g., "NSE:INFY", "BSE:RELIANCE")',
  inputSchema: {
    symbols: z.array(z.string()).describe('List of symbols to fetch quotes for')
  }
}, async ({ symbols }: { symbols: string[] }) => {
  try {
    const quotes = await getQuote(symbols);
    return {
      content: [{ type: 'text', text: JSON.stringify(quotes, null, 2) }]
    };
  } catch (err) {
    return formatError(err);
  }
});

// --- TRADING TOOLS ---

server.registerTool('buy', {
  title: 'Buy Stock',
  description: 'Place a MARKET BUY order. CAUTION: Exectutes immediately.',
  inputSchema: {
    symbol: z.string().describe('Trading symbol (e.g., INFY)'),
    quantity: z.number().int().positive(),
    exchange: z.enum(['NSE', 'BSE']).optional().default('NSE'),
    product: z.enum(['CNC', 'MIS']).optional().default('CNC').describe('CNC for delivery, MIS for intraday')
  }
}, async ({ symbol, quantity, exchange }: { symbol: string, quantity: number, exchange?: string }) => { // Note: exchange param unused in placeOrder currently, defaulting to NSE in trade.ts
  try {
    const orderId = await placeOrder(symbol, quantity, 'BUY');
    return {
      content: [{
        type: 'text',
        text: `✅ BUY Order Placed!\nSymbol: ${symbol}\nQty: ${quantity}\nOrder ID: ${orderId.orderId}\nStatus: ${orderId.status}`
      }]
    };
  } catch (err) {
    return formatError(err);
  }
});

server.registerTool('sell', {
  title: 'Sell Stock',
  description: 'Place a MARKET SELL order. CAUTION: Exectutes immediately.',
  inputSchema: {
    symbol: z.string().describe('Trading symbol (e.g., INFY)'),
    quantity: z.number().int().positive(),
    exchange: z.enum(['NSE', 'BSE']).optional().default('NSE'),
    product: z.enum(['CNC', 'MIS']).optional().default('CNC')
  }
}, async ({ symbol, quantity }: { symbol: string, quantity: number }) => {
  try {
    const orderId = await placeOrder(symbol, quantity, 'SELL');
    return {
      content: [{
        type: 'text',
        text: `✅ SELL Order Placed!\nSymbol: ${symbol}\nQty: ${quantity}\nOrder ID: ${orderId.orderId}\nStatus: ${orderId.status}`
      }]
    };
  } catch (err) {
    return formatError(err);
  }
});

// Entry point
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Zerodha MCP Server running on stdio');
}

main();