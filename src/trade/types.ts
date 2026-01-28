export type OrderAction = 'BUY' | 'SELL';
export type ProductType = 'CNC' | 'MIS';

export interface OrderResult {
  orderId: string;
  isAMO: boolean;
  status: string;
  timestamp: Date;
}