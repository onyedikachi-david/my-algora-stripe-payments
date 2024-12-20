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
import { HelpCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

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

interface DailyData {
  date: string;
  volume: number;
  count: number;
  avgSize: number;
  rawDate: Date;
}

function CustomTooltip({ content }: { content: string }) {
  return (
    <div className="group relative inline-block">
      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200" />
      <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 shadow-lg">
        {content}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900"></div>
      </div>
    </div>
  );
}

export function TransactionChart({ transactions }: Props) {
  // Group transactions by date
  const dailyData = transactions.reduce((acc, t) => {
    const date = format(parseISO(t.created), 'MMM dd');
    const rawDate = parseISO(t.created);
    const amount = Math.abs(t.customerFacingAmount || 0);
    
    if (!acc[date]) {
      acc[date] = {
        date,
        volume: 0,
        count: 0,
        avgSize: 0,
        rawDate
      };
    }
    
    const data = acc[date];
    data.volume += amount;
    data.count++;
    data.avgSize = data.volume / data.count;
    
    return acc;
  }, {} as Record<string, DailyData>);

  const sortedDays = Object.values(dailyData)
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

  // Calculate trend metrics
  const latestDay = sortedDays[sortedDays.length - 1];
  const previousDay = sortedDays[sortedDays.length - 2];
  const volumeChange = previousDay
    ? ((latestDay.volume - previousDay.volume) / previousDay.volume) * 100
    : 0;
  const countChange = previousDay
    ? ((latestDay.count - previousDay.count) / previousDay.count) * 100
    : 0;

  // Calculate overall statistics
  const totalVolume = sortedDays.reduce((sum, day) => sum + day.volume, 0);
  const totalCount = sortedDays.reduce((sum, day) => sum + day.count, 0);
  const avgDailyVolume = totalVolume / sortedDays.length;
  const avgDailyCount = totalCount / sortedDays.length;

  const data = {
    labels: sortedDays.map(d => d.date),
    datasets: [
      {
        label: 'Volume',
        data: sortedDays.map(d => d.volume),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        yAxisID: 'y',
        fill: true,
      },
      {
        label: 'Transaction Count',
        data: sortedDays.map(d => d.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y1',
        fill: true,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Daily Transaction Activity</h3>
            <CustomTooltip content="Analysis of daily transaction volumes and counts" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Daily transaction patterns and trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Latest Volume</p>
            <p className="text-lg font-semibold">
              {latestDay.volume.toLocaleString('en-US', {
                style: 'currency',
                currency: 'usd',
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className={`flex items-center gap-1 ${
            volumeChange > 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {volumeChange > 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(volumeChange).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-600">Average Daily Volume</p>
          <p className="text-xl font-semibold text-indigo-900">
            {avgDailyVolume.toLocaleString('en-US', {
              style: 'currency',
              currency: 'usd',
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="text-xs text-indigo-500 mt-1">Mean daily transaction volume</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-sm text-emerald-600">Average Daily Count</p>
          <p className="text-xl font-semibold text-emerald-900">
            {Math.round(avgDailyCount).toLocaleString()}
          </p>
          <p className="text-xs text-emerald-500 mt-1">Mean daily transactions</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Transaction Growth</p>
          <p className="text-xl font-semibold text-purple-900">
            {countChange > 0 ? '+' : ''}{countChange.toFixed(1)}%
          </p>
          <p className="text-xs text-purple-500 mt-1">Day-over-day change</p>
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
                    return context.datasetIndex === 0
                      ? `${label}: ${value.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'usd',
                          maximumFractionDigits: 0,
                        })}`
                      : `${label}: ${value.toLocaleString()} transactions`;
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
                  text: 'Volume (USD)',
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
                  text: 'Transaction Count',
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          }}
        />
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Volume represents the total transaction amount in USD for each day</p>
        <p>* Growth rates compare the latest day to the previous day</p>
      </div>
    </div>
  );
}