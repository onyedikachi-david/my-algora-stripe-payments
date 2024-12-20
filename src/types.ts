export interface Transaction {
  id: string;
  type: 'payout' | 'payment';
  source: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  created: string;
  availableOn: string;
  description: string;
  customerFacingAmount: number | null;
  customerFacingCurrency: string | null;
  transfer: string;
  transferDate: string;
}