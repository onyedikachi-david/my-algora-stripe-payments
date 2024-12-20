import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { TrendingUp, ArrowUpDown, Activity } from 'lucide-react';
import { MetricCard, ExpandableSection } from './shared/UIComponents';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  transactions: Transaction[];
}

interface MonthlyMetrics {
  volume: number;
  count: number;
  avgSize: number;
  growth: number;
}

export function MonthlyVolumeTrends({ transactions }: Props) {
  // Group transactions by month
  const monthlyData = transactions.reduce((acc, t) => {
    const month = format(parseISO(t.created), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = {
        volume: 0,
        count: 0,
        avgSize: 0,
        growth: 0
      };
    }
    acc[month].volume += Math.abs(t.customerFacingAmount || 0);
    acc[month].count++;
    return acc;
  }, {} as Record<string, MonthlyMetrics>);

  // Calculate averages and growth rates
  const months = Object.keys(monthlyData).sort();
  months.forEach((month, index) => {
    const data = monthlyData[month];
    data.avgSize = data.volume / data.count;
    
    if (index > 0) {
      const prevMonth = months[index - 1];
      const prevVolume = monthlyData[prevMonth].volume;
      data.growth = ((data.volume - prevVolume) / prevVolume) * 100;
    }
  });

  // Calculate overall metrics
  const totalVolume = Object.values(monthlyData).reduce((sum, d) => sum + d.volume, 0);
  const avgMonthlyVolume = totalVolume / months.length;
  const latestGrowth = monthlyData[months[months.length - 1]]?.growth || 0;

  // Calculate trend metrics
  const growthRates = months.slice(1).map(month => monthlyData[month].growth);
  const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  const volatility = Math.sqrt(
    growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) / growthRates.length
  );

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Volume',
        data: months.map(month => monthlyData[month].volume),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Average Volume',
        data: Array(months.length).fill(avgMonthlyVolume),
        borderColor: 'rgba(34, 197, 94, 0.5)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const detailedMetrics = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Monthly Breakdown</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Month</th>
                <th className="text-right py-2">Volume</th>
                <th className="text-right py-2">Growth</th>
              </tr>
            </thead>
            <tbody>
              {months.map(month => (
                <tr key={month} className="border-b last:border-0">
                  <td className="py-2">{month}</td>
                  <td className="text-right">
                    {monthlyData[month].volume.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'usd',
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className={`text-right ${
                    monthlyData[month].growth > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {monthlyData[month].growth.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Growth Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Growth Rate:</span>
              <span className="font-medium">{avgGrowthRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Volatility:</span>
              <span className="font-medium">{volatility.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Highest Monthly Volume:</span>
              <span className="font-medium">
                {Math.max(...Object.values(monthlyData).map(d => d.volume))
                  .toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'usd',
                    maximumFractionDigits: 0,
                  })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Volume Insights</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>
            Monthly volumes show {avgGrowthRate > 0 ? 'positive' : 'negative'} trend with {Math.abs(avgGrowthRate).toFixed(1)}% average growth
          </li>
          <li>
            Growth volatility of {volatility.toFixed(1)}% indicates {
              volatility > 15 ? 'significant' : 'moderate'
            } month-to-month variations
          </li>
          <li>
            Latest month shows {latestGrowth > 0 ? 'growth' : 'decline'} of {Math.abs(latestGrowth).toFixed(1)}%
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-6">Monthly Volume Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Latest Growth"
            value={`${latestGrowth.toFixed(1)}%`}
            subtitle="Month-over-month change"
            tooltip="Percentage change in volume from previous month"
            trend={{ value: latestGrowth, isPositive: latestGrowth > 0 }}
            icon={TrendingUp}
            colorClass="bg-indigo-50"
          />

          <MetricCard
            title="Average Volume"
            value={avgMonthlyVolume.toLocaleString('en-US', {
              style: 'currency',
              currency: 'usd',
              maximumFractionDigits: 0,
            })}
            subtitle="Per month"
            tooltip="Average monthly transaction volume"
            icon={ArrowUpDown}
            colorClass="bg-emerald-50"
          />

          <MetricCard
            title="Volume Trend"
            value={`${avgGrowthRate.toFixed(1)}%`}
            subtitle="Average monthly growth"
            tooltip="Average month-over-month growth rate"
            trend={{ value: avgGrowthRate, isPositive: avgGrowthRate > 0 }}
            icon={Activity}
            colorClass="bg-purple-50"
          />
        </div>
      </div>

      <div className="h-80">
        <Line
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
                    const month = months[context.dataIndex];
                    const monthData = monthlyData[month];
                    const lines = [
                      `${label}: ${value.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'usd',
                        maximumFractionDigits: 0,
                      })}`,
                    ];
                    if (monthData && context.datasetIndex === 0) {
                      lines.push(
                        `Growth: ${monthData.growth.toFixed(1)}%`,
                        `Transactions: ${monthData.count.toLocaleString()}`
                      );
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
                title: {
                  display: true,
                  text: 'Volume (USD)',
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
            },
          }}
        />
      </div>

      <ExpandableSection
        title="Detailed Volume Analysis"
        tooltip="View comprehensive monthly volume statistics and growth trends"
        defaultExpanded={false}
      >
        {detailedMetrics}
      </ExpandableSection>

      <div className="text-xs text-gray-500 space-y-1">
        <p>* Growth rates compare each month to the previous month</p>
        <p>* Average growth rate excludes the first month</p>
        <p>* Hover over the chart for detailed monthly metrics</p>
        <p>* Click on any value to copy it to your clipboard</p>
      </div>
    </div>
  );
}