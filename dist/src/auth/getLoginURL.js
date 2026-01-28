// ✅ getLoginURL.ts (updated for ESM)
import { KiteConnect } from 'kiteconnect';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const kc = new KiteConnect({
    api_key: process.env.API_KEY
});
const loginUrl = kc.getLoginURL();
console.log('\n\x1b[36m=== ZERODHA LOGIN URL ===\x1b[0m');
console.log('\x1b[33m' + loginUrl + '\x1b[0m');
console.log('\nInstructions:');
console.log('1. Open this URL in your browser');
console.log('2. Login to your Zerodha account');
console.log('3. After redirect, copy the "request_token" from URL\n');
//# sourceMappingURL=getLoginURL.js.map