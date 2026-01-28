# Zerodha Trading MCP Server 🦾📈

A Node.js-based MCP (Model Context Protocol) server for Zerodha's Kite Connect API.
This server allows AI agents (like Claude Desktop) to access your Zerodha portfolio and execute trades.

## ⚙️ Features

- **MCP Support**: Fully compatible with Claude Desktop and other MCP clients.
- **Tools Included**:
    - `get_holdings`: View long-term holdings.
    - `get_positions`: View intraday positions.
    - `get_funds`: Check available margin/cash.
    - `get_quote`: Get live quotes for symbols.
    - `buy` / `sell`: Execute market orders.
- **Secure**: Tokens stored locally in `.env.token`.

## 🚀 Getting Started

### 1. Setup
```bash
# Clone and enter directory
git clone https://github.com/shetharya/zerodha-trading-bot.git
cd zerodha-trade-main

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Configuration
Create a `.env` file in the root directory:
```env
API_KEY=your_zerodha_api_key
API_SECRET=your_zerodha_api_secret
```

### 3. Authentication
You need to generate a session before using the server.
```bash
# 1. Get Login URL
npm run login

# 2. Open URL, login, and copy 'request_token' from the redirect URL.

# 3. Generate Session
npm run session <request_token>
```

### 4. Connect to Claude Desktop
Add this to your Claude Desktop configuration file (%APPDATA%\Claude\claude_desktop_config.json):

```json
{
  "mcpServers": {
    "zerodha": {
      "command": "node",
      "args": ["C:/Users/sidma/OneDrive/Desktop/VS Code/zerodha-trade-main/dist/src/index.js"]
    }
  }
}
```

