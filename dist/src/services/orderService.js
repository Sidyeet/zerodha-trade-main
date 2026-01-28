import { KiteConnect } from 'kiteconnect';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
export async function placeOrder(symbol, quantity, transactionType) {
    try {
        const tokenPath = path.resolve(__dirname, '../../.env.token');
        if (!fs.existsSync(tokenPath)) {
            throw new Error('.env.token file not found');
        }
        const tokenContent = fs.readFileSync(tokenPath, 'utf-8');
        const accessTokenLine = tokenContent
            .split('\n')
            .find(line => line.trim().startsWith('ACCESS_TOKEN='));
        if (!accessTokenLine) {
            throw new Error('ACCESS_TOKEN not found in .env.token');
        }
        const accessToken = accessTokenLine.split('=')[1].trim();
        const kc = new KiteConnect({ api_key: process.env.API_KEY });
        kc.setAccessToken(accessToken);
        await kc.getProfile(); // confirm connection
        const order = await kc.placeOrder('regular', {
            exchange: 'NSE',
            tradingsymbol: symbol,
            transaction_type: transactionType,
            quantity: quantity,
            product: 'CNC',
            order_type: 'MARKET'
        });
        if (!order?.order_id) {
            throw new Error('Kite API did not return order_id');
        }
        return order.order_id;
    }
    catch (error) {
        throw new Error(`Order failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=orderService.js.map