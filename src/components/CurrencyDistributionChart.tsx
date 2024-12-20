import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Transaction } from '../types';
import { Coins, ArrowUpDown, Wallet } from 'lucide-react';
import { MetricCard, ExpandableSection } from './shared/UIComponents';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface Props {
  transactions: Transaction[];
}

interface CurrencyMetrics {
  volume: number;
  count: number;
  avgSize: number;
  percentageVolume: number;
  percentageCount: number;
}

function formatCurrencyValue(value: number, currencyCode: string): string {
  // Handle unknown or invalid currency codes
  if (!currencyCode || currencyCode === 'UNKNOWN') {
    return value.toLocaleString('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    });
  }

  try {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: currencyCode.toLowerCase(),
      maximumFractionDigits: 0,
    });
  } catch (error) {
    // Fallback to decimal format if currency code is invalid
    return value.toLocaleString('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    });
  }
}

export function CurrencyDistributionChart({ transactions }: Props) {
  // Group transactions by currency
  const currencyData = transactions.reduce((acc, t) => {
    const currency = t.customerFacingCurrency?.toUpperCase() || 'UNKNOWN';
    if (!acc[currency]) {
      acc[currency] = {
        volume: 0,
        count: 0,
        avgSize: 0,
        percentageVolume: 0,
        percentageCount: 0
      };
    }
    acc[currency].volume += Math.abs(t.customerFacingAmount || 0);
    acc[currency].count++;
    return acc;
  }, {} as Record<string, CurrencyMetrics>);

  // Calculate percentages and averages
  const totalVolume = Object.values(currencyData).reduce((sum, d) => sum + d.volume, 0);
  const totalCount = Object.values(currencyData).reduce((sum, d) => sum + d.count, 0);

  Object.entries(currencyData).forEach(([currency, data]) => {
    data.avgSize = data.volume / data.count;
    data.percentageVolume = (data.volume / totalVolume) * 100;
    data.percentageCount = (data.count / totalCount) * 100;
  });

  // Sort currencies by volume
  const sortedCurrencies = Object.entries(currencyData)
    .sort(([, a], [, b]) => b.volume - a.volume);

  const data = {
    labels: sortedCurrencies.map(([currency]) => currency),
    datasets: [
      {
        data: sortedCurrencies.map(([, data]) => data.volume),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const primaryCurrency = sortedCurrencies[0]?.[0] || 'N/A';
  const primaryShare = sortedCurrencies[0]?.[1].percentageVolume || 0;
  const currencyCount = sortedCurrencies.length;
  const avgTransactionSize = totalVolume / totalCount;

  const detailedMetrics = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Currency Distribution</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Currency</th>
                <th className="text-right py-2">Volume</th>
                <th className="text-right py-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {sortedCurrencies.map(([currency, data]) => (
                <tr key={currency} className="border-b last:border-0">
                  <td className="py-2">{currency}</td>
                  <td className="text-right">
                    {formatCurrencyValue(data.volume, currency)}
                  </td>
                  <td className="text-right">{data.percentageVolume.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Transaction Analysis</h4>
          <div className="space-y-2">
            {sortedCurrencies.map(([currency, data]) => (
              <div key={currency} className="flex justify-between">
                <span className="text-gray-600">{currency} Avg Size:</span>
                <span className="font-medium">
                  {formatCurrencyValue(data.avgSize, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Distribution Insights</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>
            {primaryCurrency} is the dominant currency with {primaryShare.toFixed(1)}% of total volume
          </li>
          <li>
            Average transaction sizes vary significantly across currencies
          </li>
          <li>
            Supporting {currencyCount} different currencies in total
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-6">Currency Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Primary Currency"
            value={primaryCurrency}
            subtitle={`${primaryShare.toFixed(1)}% of volume`}
            tooltip="Most frequently used currency by transaction volume"
            icon={Coins}
            colorClass="bg-indigo-50"
          />

          <MetricCard
            title="Currencies Supported"
            value={currencyCount.toString()}
            subtitle="Active currencies"
            tooltip="Number of different currencies processed"
            icon={Wallet}
            colorClass="bg-emerald-50"
          />

          <MetricCard
            title="Average Transaction"
            value={avgTransactionSize.toLocaleString('en-US', {
              style: 'currency',
              currency: 'usd',
              maximumFractionDigits: 0,
            })}
            subtitle="Overall average"
            tooltip="Average transaction size across all currencies (in USD)"
            icon={ArrowUpDown}
            colorClass="bg-purple-50"
          />
        </div>
      </div>

      <div className="h-80">
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  usePointStyle: true,
                  boxWidth: 6
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const currency = context.label;
                    const value = context.raw as number;
                    const currencyData = sortedCurrencies.find(([c]) => c === currency)?.[1];
                    const lines = [
                      `Volume: ${formatCurrencyValue(value, currency)}`,
                    ];
                    if (currencyData) {
                      lines.push(
                        `Share: ${currencyData.percentageVolume.toFixed(1)}%`,
                        `Transactions: ${currencyData.count.toLocaleString()}`
                      );
                    }
                    return lines;
                  }
                }
              }
            },
          }}
        />
      </div>

      <ExpandableSection
        title="Detailed Currency Analysis"
        tooltip="View comprehensive currency distribution statistics and insights"
        defaultExpanded={false}
      >
        {detailedMetrics}
      </ExpandableSection>

      <div className="text-xs text-gray-500 space-y-1">
        <p>* Percentages are based on total transaction volume</p>
        <p>* Average sizes are calculated per currency</p>
        <p>* Hover over the chart for detailed metrics</p>
        <p>* Click on any value to copy it to your clipboard</p>
      </div>
    </div>
  );
}