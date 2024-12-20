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
import { HelpCircle, Calendar } from 'lucide-react';

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

interface WeekdayData {
  day: string;
  count: number;
  volume: number;
  avgSize: number;
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

export function WeekdayAnalysis({ transactions }: Props) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Initialize weekday data
  const weekdayData = weekdays.reduce((acc, day) => {
    acc[day] = {
      day,
      count: 0,
      volume: 0,
      avgSize: 0
    };
    return acc;
  }, {} as Record<string, WeekdayData>);

  // Group transactions by weekday
  transactions.forEach(t => {
    const date = parseISO(t.created);
    const day = format(date, 'EEEE');
    const amount = Math.abs(t.customerFacingAmount || 0);
    
    weekdayData[day].count++;
    weekdayData[day].volume += amount;
  });

  // Calculate average sizes
  Object.values(weekdayData).forEach(data => {
    data.avgSize = data.volume / data.count;
  });

  // Find peak day
  const peakDay = Object.values(weekdayData).reduce((peak, current) =>
    current.count > peak.count ? current : peak
  );

  const totalTransactions = Object.values(weekdayData).reduce((sum, day) => sum + day.count, 0);
  const totalVolume = Object.values(weekdayData).reduce((sum, day) => sum + day.volume, 0);
  const avgDailyTransactions = totalTransactions / weekdays.length;

  const data = {
    labels: weekdays,
    datasets: [
      {
        label: 'Transaction Count',
        data: weekdays.map(day => weekdayData[day].count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Volume',
        data: weekdays.map(day => weekdayData[day].volume),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Weekday Distribution</h3>
            <CustomTooltip content="Analysis of transaction patterns across different days of the week" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Weekly transaction patterns and peak days
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Peak Day</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <Calendar className="h-5 w-5 text-indigo-500" />
              {peakDay.day}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-600">Peak Day Volume</p>
          <p className="text-xl font-semibold text-indigo-900">
            {peakDay.volume.toLocaleString('en-US', {
              style: 'currency',
              currency: 'usd',
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="text-xs text-indigo-500 mt-1">Highest daily volume</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-sm text-emerald-600">Average Daily Count</p>
          <p className="text-xl font-semibold text-emerald-900">
            {Math.round(avgDailyTransactions).toLocaleString()}
          </p>
          <p className="text-xs text-emerald-500 mt-1">Mean transactions per day</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Peak Day Count</p>
          <p className="text-xl font-semibold text-purple-900">
            {peakDay.count.toLocaleString()}
          </p>
          <p className="text-xs text-purple-500 mt-1">Maximum daily transactions</p>
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
                    return context.datasetIndex === 0
                      ? `${label}: ${value.toLocaleString()} transactions`
                      : `${label}: ${value.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'usd',
                          maximumFractionDigits: 0,
                        })}`;
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

      <div className="mt-4 text-xs text-gray-500">
        <p>* Analysis is based on the transaction creation date</p>
        <p>* All monetary values are shown in USD</p>
      </div>
    </div>
  );
}