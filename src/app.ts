import { exec } from 'child_process';
import readline from 'readline';
import { KiteConnect } from 'kiteconnect';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateSession } from './auth/generateSession.js';
import { getHoldings, getPositions, getMargins, placeOrder } from './trade/trade.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

function clearScreen() {
    console.log('\x1b[2J\x1b[0f');
}

async function showMenu() {
    console.log('\n=============================================');
    console.log('       📈 ZERODHA TRADING APP (CLI)         ');
    console.log('=============================================');
    console.log('1. 🔑 Login (Auto-open Browser)');
    console.log('2. 🎟️  Enter Request Token (Generate Session)');
    console.log('3. 💼 View Holdings');
    console.log('4. 📊 View Positions');
    console.log('5. 💰 View Funds');
    console.log('6. 🛒 Buy Stock');
    console.log('7. 🏷️  Sell Stock');
    console.log('8. 🚪 Exit');
    console.log('=============================================');
}

async function handleLogin() {
    const kc = new KiteConnect({ api_key: process.env.API_KEY || '' });
    const loginUrl = kc.getLoginURL();

    console.log('\n--- LOGIN URL ---');
    console.log(loginUrl);
    console.log('-----------------');
    console.log('Attempting to open browser automatically...');

    // Open URL on Windows
    exec(`start "${loginUrl}"`, (err) => {
        if (err) {
            console.error('Could not open browser automatically. Please copy the link above.');
        }
    });

    console.log('Instructions:');
    console.log('1. Login in the browser window.');
    console.log('2. Copy the "request_token" from the redirect URL.');
    await question('\nPress Enter to return to menu...');
}

async function handleSession() {
    const token = await question('\nEnter request_token: ');
    if (!token) return;

    try {
        const session = await generateSession(token);
        if (session) {
            console.log('\n✅ Session generated and saved successfully!');
        }
    } catch (err) {
        console.error('\n❌ Failed to generate session.');
    }
    await question('\nPress Enter to return to menu...');
}

async function handleHoldings() {
    try {
        const holdings = await getHoldings();
        console.table(holdings);
    } catch (err: any) {
        console.error('Error fetching holdings:', err.message);
    }
    await question('\nPress Enter to return to menu...');
}

async function handlePositions() {
    try {
        const positions = await getPositions();
        console.log('\n--- DAY POSITIONS ---');
        console.table(positions.day);
        console.log('\n--- NET POSITIONS ---');
        console.table(positions.net);
    } catch (err: any) {
        console.error('Error fetching positions:', err.message);
    }
    await question('\nPress Enter to return to menu...');
}

async function handleFunds() {
    try {
        const funds = await getMargins();
        console.table(funds);
    } catch (err: any) {
        console.error('Error fetching funds:', err.message);
    }
    await question('\nPress Enter to return to menu...');
}

async function handleTrade(type: 'BUY' | 'SELL') {
    const symbol = await question(`\nEnter Symbol to ${type} (e.g., INFY): `);
    if (!symbol) return;
    const qtyStr = await question(`Enter Quantity: `);
    const qty = parseInt(qtyStr);

    if (isNaN(qty) || qty <= 0) {
        console.error('Invalid quantity');
        return;
    }

    const confirm = await question(`\n⚠️  CONFIRM: ${type} ${qty} shares of ${symbol} at MARKET price? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
        console.log('Cancelled.');
        return;
    }

    try {
        const result = await placeOrder(symbol.toUpperCase(), qty, type, 'CNC'); // Defaulting to CNC for simplicity in CLI
        console.log(`\n✅ ${type} Order Placed!`);
        console.log(`Order ID: ${result.orderId}`);
        console.log(`Status: ${result.status}`);
    } catch (err: any) {
        console.error(`\n❌ ${type} Failed:`, err.message);
    }

    await question('\nPress Enter to return to menu...');
}

async function main() {
    while (true) {
        clearScreen();
        await showMenu();
        const choice = await question('Select an option (1-8): ');

        switch (choice) {
            case '1': await handleLogin(); break;
            case '2': await handleSession(); break;
            case '3': await handleHoldings(); break;
            case '4': await handlePositions(); break;
            case '5': await handleFunds(); break;
            case '6': await handleTrade('BUY'); break;
            case '7': await handleTrade('SELL'); break;
            case '8':
                console.log('Goodbye! 👋');
                rl.close();
                process.exit(0);
            default: console.log('Invalid option.'); break;
        }
    }
}

main();
