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
import { differenceInMinutes, parseISO } from 'date-fns';
import { Clock, Zap, Activity } from 'lucide-react';
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

interface ProcessingMetrics {
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  stdDev: number;
}

function calculateProcessingTime(transaction: Transaction): number {
  if (!transaction.created || !transaction.availableOn) return 0;
  return differenceInMinutes(parseISO(transaction.availableOn), parseISO(transaction.created));
}

function calculateMetrics(times: number[]): ProcessingMetrics {
  const count = times.length;
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const avgTime = totalTime / count;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    count,
    totalTime,
    avgTime,
    minTime,
    maxTime,
    stdDev
  };
}

export function ProcessingEfficiency({ transactions }: Props) {
  // Calculate processing times
  const processingTimes = transactions
    .filter(t => t.created && t.availableOn)
    .map(calculateProcessingTime);

  const metrics = calculateMetrics(processingTimes);

  // Group processing times into intervals
  const intervals = [5, 15, 30, 60, 120, 'More'];
  const distribution = processingTimes.reduce((acc, time) => {
    const interval = intervals.find(i => typeof i === 'number' && time <= i) || 'More';
    acc[interval] = (acc[interval] || 0) + 1;
    return acc;
  }, {} as Record<string | number, number>);

  // Calculate efficiency metrics
  const fastProcessing = processingTimes.filter(time => time <= 15).length;
  const fastProcessingRate = (fastProcessing / processingTimes.length) * 100;
  const medianTime = processingTimes.sort((a, b) => a - b)[Math.floor(processingTimes.length / 2)];

  const data = {
    labels: intervals.map(i => typeof i === 'number' ? `≤ ${i} min` : `${i}`),
    datasets: [
      {
        label: 'Transactions',
        data: intervals.map(i => distribution[i] || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const detailedMetrics = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Processing Time Distribution</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Time Range</th>
                <th className="text-right py-2">Count</th>
                <th className="text-right py-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {intervals.map(interval => (
                <tr key={interval} className="border-b last:border-0">
                  <td className="py-2">
                    {typeof interval === 'number' ? `≤ ${interval} min` : interval}
                  </td>
                  <td className="text-right">{distribution[interval] || 0}</td>
                  <td className="text-right">
                    {((distribution[interval] || 0) / processingTimes.length * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Statistical Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Standard Deviation:</span>
              <span className="font-medium">{metrics.stdDev.toFixed(1)} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Median Time:</span>
              <span className="font-medium">{medianTime} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Range:</span>
              <span className="font-medium">{metrics.minTime}-{metrics.maxTime} min</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Efficiency Insights</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>
            {fastProcessingRate.toFixed(1)}% of transactions are processed within 15 minutes
          </li>
          <li>
            Average processing time shows {
              metrics.stdDev / metrics.avgTime > 0.5 ? 'high' : 'moderate'
            } variability
          </li>
          <li>
            Median processing time is {
              medianTime < metrics.avgTime ? 'lower' : 'higher'
            } than the mean, indicating {
              medianTime < metrics.avgTime ? 'positive' : 'negative'
            } skew
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-6">Processing Efficiency</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Average Time"
            value={`${metrics.avgTime.toFixed(1)} min`}
            subtitle="Mean processing time"
            tooltip="Average time to process a transaction"
            icon={Clock}
            colorClass="bg-indigo-50"
          />

          <MetricCard
            title="Fast Processing"
            value={`${fastProcessingRate.toFixed(1)}%`}
            subtitle="Within 15 minutes"
            tooltip="Percentage of transactions processed within 15 minutes"
            icon={Zap}
            colorClass="bg-emerald-50"
          />

          <MetricCard
            title="Processing Range"
            value={`${metrics.minTime}-${metrics.maxTime} min`}
            subtitle="Min-Max time"
            tooltip="Range of processing times from fastest to slowest"
            icon={Activity}
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
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const count = context.raw as number;
                    const percentage = (count / processingTimes.length * 100).toFixed(1);
                    return [
                      `Count: ${count.toLocaleString()} transactions`,
                      `Share: ${percentage}%`
                    ];
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
                  text: 'Number of Transactions',
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
        title="Detailed Efficiency Analysis"
        tooltip="View comprehensive processing time statistics and distribution"
        defaultExpanded={false}
      >
        {detailedMetrics}
      </ExpandableSection>

      <div className="text-xs text-gray-500 space-y-1">
        <p>* Processing time is measured from transaction creation to completion</p>
        <p>* Fast processing is defined as completion within 15 minutes</p>
        <p>* Hover over the chart for detailed metrics</p>
        <p>* Click on any value to copy it to your clipboard</p>
      </div>
    </div>
  );
}