import { KiteConnect } from 'kiteconnect';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// ESM-safe __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
export async function generateSession(requestToken) {
    try {
        console.log('\n=== ATTEMPTING SESSION GENERATION ===');
        const kc = new KiteConnect({
            api_key: process.env.API_KEY
        });
        console.log('Creating session with request token...');
        const session = await kc.generateSession(requestToken, process.env.API_SECRET);
        // Save tokens to file
        fs.writeFileSync(path.resolve(process.cwd(), '.env.token'), `ACCESS_TOKEN=${session.access_token}\nPUBLIC_TOKEN=${session.public_token}`);
        console.log('\n✅ SUCCESS! Tokens saved to .env.token');
        console.log(`Access Token: ${session.access_token.substring(0, 10)}...`);
        console.log(`Public Token: ${session.public_token.substring(0, 10)}...`);
        return session;
    }
    catch (error) {
        console.error('\n❌ ERROR GENERATING SESSION:');
        console.error(error);
        process.exit(1);
    }
}
// Run if executed directly (ESM-style)
// Run if executed directly
const requestToken = process.argv[2];
if (requestToken) {
    generateSession(requestToken);
}
else {
    // If no token provided, we might be importing it, or user forgot it.
    // We can log a message if it looks like they tried to run it.
    if (process.argv[1].includes('generateSession')) {
        console.error('Usage: npm run session <request_token>');
        process.exit(1);
    }
}
//# sourceMappingURL=generateSession.js.map