declare module 'kiteconnect' {
    export class KiteConnect {
        constructor(params: { api_key: string });
        setAccessToken(accessToken: string): void;
        getLoginURL(): string;
        generateSession(request_token: string, api_secret: string): Promise<{
            access_token: string;
            public_token: string;
            [key: string]: any;
        }>;
        placeOrder(variety: string, params: any): Promise<any>;
        getHoldings(): Promise<any>;
        getPositions(): Promise<any>;
        getQuote(instruments: string[]): Promise<any>;
        getMargins(): Promise<any>;
    }
}
