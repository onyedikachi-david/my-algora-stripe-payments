import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { Banknote, Activity, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { MetricCard, ExpandableSection } from './shared/UIComponents';

interface Props {
  transactions: Transaction[];
}

interface MonthlyMetrics {
  volume: number;
  count: number;
  avgSize: number;
  uniqueCustomers: number;
}

export function TransactionSummary({ transactions }: Props) {
  // Calculate total volume and count
  const totalVolume = transactions.reduce((sum, t) => sum + Math.abs(t.customerFacingAmount || 0), 0);
  const totalCount = transactions.length;

  // Group transactions by month for trend analysis
  const monthlyData = transactions.reduce((acc, t) => {
    const month = format(parseISO(t.created), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = {
        volume: 0,
        count: 0,
        avgSize: 0,
        uniqueCustomers: new Set()
      };
    }
    acc[month].volume += Math.abs(t.customerFacingAmount || 0);
    acc[month].count++;
    acc[month].uniqueCustomers.add(t.customer);
    return acc;
  }, {} as Record<string, MonthlyMetrics & { uniqueCustomers: Set<string> }>);

  // Calculate average sizes and convert Sets to counts
  Object.values(monthlyData).forEach(data => {
    data.avgSize = data.volume / data.count;
    data.uniqueCustomers = data.uniqueCustomers.size;
  });

  const months = Object.keys(monthlyData).sort();
  const latestMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];

  // Calculate month-over-month growth
  const volumeGrowth = previousMonth
    ? ((monthlyData[latestMonth].volume - monthlyData[previousMonth].volume) / monthlyData[previousMonth].volume) * 100
    : 0;
  const countGrowth = previousMonth
    ? ((monthlyData[latestMonth].count - monthlyData[previousMonth].count) / monthlyData[previousMonth].count) * 100
    : 0;
  const customerGrowth = previousMonth
    ? ((monthlyData[latestMonth].uniqueCustomers - monthlyData[previousMonth].uniqueCustomers) / monthlyData[previousMonth].uniqueCustomers) * 100
    : 0;

  // Calculate average transaction size
  const avgTransactionSize = totalVolume / totalCount;

  // Calculate unique customers
  const uniqueCustomers = new Set(transactions.map(t => t.customer)).size;

  const detailedMetrics = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Monthly Volume Trend</h4>
          <table className="w-full text-sm">
            <tbody>
              {months.slice(-3).map(month => (
                <tr key={month} className="border-b last:border-0">
                  <td className="py-2">{month}</td>
                  <td className="py-2 text-right">
                    {monthlyData[month].volume.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'usd',
                      maximumFractionDigits: 0,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Monthly Customer Growth</h4>
          <table className="w-full text-sm">
            <tbody>
              {months.slice(-3).map(month => (
                <tr key={month} className="border-b last:border-0">
                  <td className="py-2">{month}</td>
                  <td className="py-2 text-right">
                    {monthlyData[month].uniqueCustomers.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-6">Transaction Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Volume"
            value={totalVolume.toLocaleString('en-US', {
              style: 'currency',
              currency: 'usd',
              maximumFractionDigits: 0,
            })}
            subtitle="Month-over-month growth"
            tooltip="Total transaction volume processed across all currencies"
            trend={{ value: volumeGrowth, isPositive: volumeGrowth > 0 }}
            icon={Banknote}
            colorClass="bg-indigo-50"
          />

          <MetricCard
            title="Transaction Count"
            value={totalCount.toLocaleString()}
            subtitle="Month-over-month growth"
            tooltip="Total number of transactions processed"
            trend={{ value: countGrowth, isPositive: countGrowth > 0 }}
            icon={Activity}
            colorClass="bg-emerald-50"
          />

          <MetricCard
            title="Average Size"
            value={avgTransactionSize.toLocaleString('en-US', {
              style: 'currency',
              currency: 'usd',
              maximumFractionDigits: 0,
            })}
            subtitle="Per transaction"
            tooltip="Average transaction value across all transactions"
            icon={Banknote}
            colorClass="bg-purple-50"
          />

          <MetricCard
            title="Unique Customers"
            value={uniqueCustomers.toLocaleString()}
            subtitle="Total customers served"
            tooltip="Number of unique customers with transactions"
            trend={{ value: customerGrowth, isPositive: customerGrowth > 0 }}
            icon={Users}
            colorClass="bg-orange-50"
          />
        </div>
      </div>

      <ExpandableSection
        title="Detailed Metrics"
        tooltip="View detailed monthly trends and customer growth metrics"
        defaultExpanded={false}
      >
        {detailedMetrics}
      </ExpandableSection>

      <div className="text-xs text-gray-500 space-y-1">
        <p>* Growth rates compare the current month to the previous month</p>
        <p>* All monetary values are shown in USD</p>
        <p>* Click on any value to copy it to your clipboard</p>
      </div>
    </div>
  );
}