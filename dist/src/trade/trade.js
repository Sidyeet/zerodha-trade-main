import { KiteConnect } from 'kiteconnect';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// --- Helper to get authenticated Kite instance ---
async function getKiteInstance() {
    const kc = new KiteConnect({
        api_key: process.env.API_KEY || ''
    });
    const tokenPath = path.resolve(process.cwd(), '.env.token');
    if (!fs.existsSync(tokenPath)) {
        throw new Error('Missing .env.token - Generate session first');
    }
    const tokenContent = fs.readFileSync(tokenPath, 'utf-8');
    const accessToken = tokenContent
        .split('\n')
        .find(line => line.trim().startsWith('ACCESS_TOKEN='))
        ?.split('=')[1]
        ?.trim();
    if (!accessToken) {
        throw new Error('ACCESS_TOKEN not found in .env.token');
    }
    kc.setAccessToken(accessToken);
    return kc;
}
export async function placeOrder(tradingsymbol, quantity, transaction_type, product = 'CNC') {
    try {
        const kc = await getKiteInstance();
        const orderParams = {
            exchange: 'NSE',
            tradingsymbol,
            transaction_type,
            quantity,
            product,
            order_type: 'MARKET',
            validity: 'DAY'
        };
        const response = await kc.placeOrder('regular', orderParams);
        return {
            orderId: response.order_id,
            status: response.status,
            averagePrice: response.average_price,
            exchange: response.exchange
        };
    }
    catch (error) {
        throw new Error(`Order failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function getHoldings() {
    const kc = await getKiteInstance();
    return await kc.getHoldings();
}
export async function getPositions() {
    const kc = await getKiteInstance();
    return await kc.getPositions();
}
export async function getQuote(instruments) {
    const kc = await getKiteInstance();
    return await kc.getQuote(instruments);
}
export async function getMargins() {
    const kc = await getKiteInstance();
    return await kc.getMargins();
}
//# sourceMappingURL=trade.js.map