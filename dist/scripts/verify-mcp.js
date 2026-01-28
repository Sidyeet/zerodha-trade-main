import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use node to run compiled JS directly
const serverPath = path.resolve(__dirname, '../dist/src/index.js');
console.log(`Starting MCP server at: ${serverPath}`);
const serverProcess = spawn('node', [serverPath], {
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
    stdio: ['pipe', 'pipe', 'inherit']
});
let buffer = '';
serverProcess.stdout.on('data', (data) => {
    const chunk = data.toString();
    buffer += chunk;
    // Try to parse JSON messages from buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer
    for (const line of lines) {
        if (!line.trim())
            continue;
        try {
            const message = JSON.parse(line);
            console.log('Received:', JSON.stringify(message, null, 2));
            if (message.id === 1) {
                console.log('Server initialized. Sending tools/list...');
                // Send tools/list
                const listRequest = {
                    jsonrpc: '2.0',
                    id: 2,
                    method: 'tools/list'
                };
                serverProcess.stdin.write(JSON.stringify(listRequest) + '\n');
            }
            else if (message.id === 2) {
                console.log('Tools listed successfully!');
                const tools = message.result.tools.map((t) => t.name);
                console.log('Available Tools:', tools);
                process.exit(0);
            }
        }
        catch (e) {
            // Not JSON or partial JSON
        }
    }
});
// Send initialize request
const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
            name: 'verify-script',
            version: '1.0.0'
        }
    }
};
serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');
// Timeout
setTimeout(() => {
    console.error('Timeout waiting for response');
    serverProcess.kill();
    process.exit(1);
}, 10000);
//# sourceMappingURL=verify-mcp.js.map