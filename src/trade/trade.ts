import { KiteConnect } from 'kiteconnect';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define proper types matching KiteConnect's expectations
type Exchange = 'NSE' | 'BSE' | 'NFO' | 'CDS' | 'MCX' | 'BCD';
type TransactionType = 'BUY' | 'SELL';
type ProductType = 'CNC' | 'MIS' | 'NRML';
type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
type Validity = 'DAY' | 'IOC';

interface KiteOrderResponse {
  order_id: string;
  status: string;
  average_price: number;
  exchange: string;
}

export interface OrderResult {
  orderId: string;
  status: string;
  averagePrice?: number;
  exchange?: string;
}

// --- Helper to get authenticated Kite instance ---
async function getKiteInstance(): Promise<KiteConnect> {
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

export async function placeOrder(
  tradingsymbol: string,
  quantity: number,
  transaction_type: TransactionType,
  product: ProductType = 'CNC'
): Promise<OrderResult> {
  try {
    const kc = await getKiteInstance();

    const orderParams = {
      exchange: 'NSE' as Exchange,
      tradingsymbol,
      transaction_type,
      quantity,
      product,
      order_type: 'MARKET' as OrderType,
      validity: 'DAY' as Validity
    };

    const response = await kc.placeOrder('regular', orderParams) as KiteOrderResponse;

    return {
      orderId: response.order_id,
      status: response.status,
      averagePrice: response.average_price,
      exchange: response.exchange
    };
  } catch (error) {
    throw new Error(
      `Order failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
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

export async function getQuote(instruments: string[]) {
  const kc = await getKiteInstance();
  return await kc.getQuote(instruments);
}

export async function getMargins() {
  const kc = await getKiteInstance();
  return await kc.getMargins();
}