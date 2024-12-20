import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Transaction } from '../types';
import { HelpCircle, DollarSign } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

interface ValueSegment {
  label: string;
  range: [number, number];
  count: number;
  volume: number;
  color: string;
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

export function ValueSegmentation({ transactions }: Props) {
  const segments: ValueSegment[] = [
    { label: 'Micro (< $100)', range: [0, 100], count: 0, volume: 0, color: 'rgba(99, 102, 241, 0.8)' },
    { label: 'Small ($100-500)', range: [100, 500], count: 0, volume: 0, color: 'rgba(34, 197, 94, 0.8)' },
    { label: 'Medium ($500-1K)', range: [500, 1000], count: 0, volume: 0, color: 'rgba(168, 85, 247, 0.8)' },
    { label: 'Large ($1K-5K)', range: [1000, 5000], count: 0, volume: 0, color: 'rgba(249, 115, 22, 0.8)' },
    { label: 'Enterprise (> $5K)', range: [5000, Infinity], count: 0, volume: 0, color: 'rgba(236, 72, 153, 0.8)' },
  ];

  // Categorize transactions
  transactions.forEach(t => {
    const amount = Math.abs(t.customerFacingAmount || 0);
    const segment = segments.find(s => amount >= s.range[0] && amount < s.range[1]);
    if (segment) {
      segment.count++;
      segment.volume += amount;
    }
  });

  const totalTransactions = segments.reduce((sum, s) => sum + s.count, 0);
  const totalVolume = segments.reduce((sum, s) => sum + s.volume, 0);

  const data = {
    labels: segments.map(s => s.label),
    datasets: [
      {
        data: segments.map(s => s.count),
        backgroundColor: segments.map(s => s.color),
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Value Segmentation</h3>
            <CustomTooltip content="Distribution of transactions across different value ranges" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Transaction categorization by size
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-indigo-500" />
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Volume</p>
            <p className="text-lg font-semibold">
              {totalVolume.toLocaleString('en-US', {
                style: 'currency',
                currency: 'usd',
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64">
          <Doughnut
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    usePointStyle: true,
                    boxWidth: 6,
                    padding: 20,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const segment = segments[context.dataIndex];
                      const percentage = ((segment.count / totalTransactions) * 100).toFixed(1);
                      return [
                        `Count: ${segment.count} (${percentage}%)`,
                        `Volume: ${segment.volume.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'usd',
                          maximumFractionDigits: 0,
                        })}`,
                      ];
                    },
                  },
                },
              },
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {segments.map(segment => (
            <div
              key={segment.label}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: segment.color.replace('0.8', '0.1') }}
            >
              <div>
                <p className="font-medium">{segment.label}</p>
                <p className="text-sm text-gray-500">
                  {((segment.count / totalTransactions) * 100).toFixed(1)}% of transactions
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {segment.volume.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'usd',
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {((segment.volume / totalVolume) * 100).toFixed(1)}% of volume
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Percentages are based on total transaction count and volume</p>
        <p>* All monetary values are shown in USD</p>
      </div>
    </div>
  );
}