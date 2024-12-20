import { Transaction } from '../types';
import { format } from 'date-fns';

export const parseTransactions = (data: string): Transaction[] => {
  return data
    .trim()
    .split('\n')
    .slice(1) // Skip header
    .map(line => {
      const [
        id, type, source, amount, fee, , , net, currency,
        created, availableOn, description, customerFacingAmount,
        customerFacingCurrency, transfer, transferDate
      ] = line.split(',');

      return {
        id,
        type,
        source,
        amount: parseFloat(amount),
        fee: parseFloat(fee),
        net: parseFloat(net),
        currency,
        created,
        availableOn,
        description,
        customerFacingAmount: customerFacingAmount ? parseFloat(customerFacingAmount) : null,
        customerFacingCurrency: customerFacingCurrency || null,
        transfer,
        transferDate
      };
    });
};

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(Math.abs(amount));
};

export const groupTransactionsByMonth = (transactions: Transaction[]) => {
  const grouped = transactions.reduce((acc, transaction) => {
    const month = format(new Date(transaction.created), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = {
        payments: 0,
        payouts: 0,
      };
    }
    
    if (transaction.type === 'payment') {
      acc[month].payments += Math.abs(transaction.amount);
    } else {
      acc[month].payouts += Math.abs(transaction.amount);
    }
    
    return acc;
  }, {} as Record<string, { payments: number; payouts: number }>);

  return Object.entries(grouped).reverse();
};