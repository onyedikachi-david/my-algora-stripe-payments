import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { Zap, Clock } from 'lucide-react';
import { MetricCard, ExpandableSection } from './shared/UIComponents';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  transactions: Transaction[];
}

interface HourlyData {
  hour: string;
  count: number;
  volume: number;
  avgSize: number;
  transactions: Transaction[];
}

export function TransactionVelocity({ transactions }: Props) {
  // Group transactions by hour of day
  const hourlyData = transactions.reduce((acc, t) => {
    const date = parseISO(t.created);
    const hour = format(date, 'HH:00');
    const amount = Math.abs(t.customerFacingAmount || 0);
    
    if (!acc[hour]) {
      acc[hour] = {
        hour,
        count: 0,
        volume: 0,
        avgSize: 0,
        transactions: []
      };
    }
    
    acc[hour].count++;
    acc[hour].volume += amount;
    acc[hour].transactions.push(t);
    acc[hour].avgSize = acc[hour].volume / acc[hour].count;
    
    return acc;
  }, {} as Record<string, HourlyData>);

  // Sort hours and calculate metrics
  const sortedHours = Object.values(hourlyData)
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const peakHour = sortedHours.reduce((peak, current) => 
    current.count > peak.count ? current : peak
  );

  const totalTransactions = sortedHours.reduce((sum, hour) => sum + hour.count, 0);
  const avgTransactionsPerHour = totalTransactions / sortedHours.length;
  const peakVolumeHour = sortedHours.reduce((peak, current) =>
    current.volume > peak.volume ? current : peak
  );

  // Calculate additional metrics
  const medianTransactionsPerHour = sortedHours
    .map(h => h.count)
    .sort((a, b) => a - b)[Math.floor(sortedHours.length / 2)];

  const hourlyVariance = sortedHours.reduce((sum, hour) => 
    sum + Math.pow(hour.count - avgTransactionsPerHour, 2), 0) / sortedHours.length;
  const hourlyStdDev = Math.sqrt(hourlyVariance);

  const data = {
    labels: sortedHours.map(h => h.hour),
    datasets: [
      {
        label: 'Transaction Count',
        data: sortedHours.map(h => h.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Volume',
        data: sortedHours.map(h => h.volume),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const detailedMetrics = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Peak Hours Analysis</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Hour</th>
                <th className="text-right py-2">Count</th>
                <th className="text-right py-2">Volume</th>
              </tr>
            </thead>
            <tbody>
              {sortedHours
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(hour => (
                  <tr key={hour.hour} className="border-b last:border-0">
                    <td className="py-2">{hour.hour}</td>
                    <td className="text-right">{hour.count.toLocaleString()}</td>
                    <td className="text-right">
                      {hour.volume.toLocaleString('en-US', {
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
          <h4 className="text-sm font-medium mb-2">Distribution Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Median Transactions/Hour:</span>
              <span className="font-medium">{medianTransactionsPerHour.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard Deviation:</span>
              <span className="font-medium">{hourlyStdDev.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Coefficient of Variation:</span>
              <span className="font-medium">
                {((hourlyStdDev / avgTransactionsPerHour) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-6">Transaction Velocity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Peak Hour Transactions"
            value={peakHour.count.toLocaleString()}
            subtitle={`at ${peakHour.hour}`}
            tooltip="Maximum number of transactions processed in a single hour"
            icon={Clock}
            colorClass="bg-indigo-50"
          />

          <MetricCard
            title="Average Velocity"
            value={Math.round(avgTransactionsPerHour).toLocaleString()}
            subtitle="transactions per hour"
            tooltip="Mean number of transactions processed per hour"
            icon={Zap}
            colorClass="bg-emerald-50"
          />

          <MetricCard
            title="Peak Hour Volume"
            value={peakVolumeHour.volume.toLocaleString('en-US', {
              style: 'currency',
              currency: 'usd',
              maximumFractionDigits: 0,
            })}
            subtitle={`at ${peakVolumeHour.hour}`}
            tooltip="Highest transaction volume processed in a single hour"
            icon={Clock}
            colorClass="bg-purple-50"
          />
        </div>
      </div>

      <div className="h-80">
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  boxWidth: 6
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || '';
                    const value = context.raw as number;
                    const hour = sortedHours[context.dataIndex];
                    const lines = [
                      context.datasetIndex === 0
                        ? `${label}: ${value.toLocaleString()} transactions`
                        : `${label}: ${value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'usd',
                            maximumFractionDigits: 0,
                          })}`,
                    ];
                    if (context.datasetIndex === 0) {
                      lines.push(`Avg Size: ${hour.avgSize.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'usd',
                        maximumFractionDigits: 0,
                      })}`);
                    }
                    return lines;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Transaction Count',
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Volume (USD)',
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          }}
        />
      </div>

      <ExpandableSection
        title="Detailed Velocity Analysis"
        tooltip="View detailed hourly transaction patterns and distribution statistics"
        defaultExpanded={false}
      >
        {detailedMetrics}
      </ExpandableSection>

      <div className="text-xs text-gray-500 space-y-1">
        <p>* Hours are shown in 24-hour format (UTC)</p>
        <p>* Volume represents the total transaction amount in USD for each hour</p>
        <p>* Hover over the chart for detailed metrics per hour</p>
        <p>* Click on any value to copy it to your clipboard</p>
      </div>
    </div>
  );
}