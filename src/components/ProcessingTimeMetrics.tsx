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
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { Clock, TrendingUp, Activity } from 'lucide-react';
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

interface DailyMetrics {
  date: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  count: number;
  totalTime: number;
  stdDev: number;
}

function calculateProcessingTime(transaction: Transaction): number {
  if (!transaction.created || !transaction.availableOn) return 0;
  return differenceInMinutes(parseISO(transaction.availableOn), parseISO(transaction.created));
}

function calculateDailyMetrics(transactions: Transaction[]): DailyMetrics[] {
  const dailyGroups = transactions.reduce((acc, t) => {
    const date = format(parseISO(t.created), 'MMM dd');
    if (!acc[date]) {
      acc[date] = {
        times: [],
        date
      };
    }
    const processingTime = calculateProcessingTime(t);
    if (processingTime > 0) {
      acc[date].times.push(processingTime);
    }
    return acc;
  }, {} as Record<string, { times: number[]; date: string }>);

  return Object.values(dailyGroups).map(({ date, times }) => {
    const count = times.length;
    if (count === 0) {
      return {
        date,
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        count: 0,
        totalTime: 0,
        stdDev: 0
      };
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / count;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / count;

    return {
      date,
      avgTime,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      count,
      totalTime,
      stdDev: Math.sqrt(variance)
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function ProcessingTimeMetrics({ transactions }: Props) {
  const dailyMetrics = calculateDailyMetrics(transactions);
  
  // Calculate overall metrics
  const validMetrics = dailyMetrics.filter(m => m.count > 0);
  const overallAvgTime = validMetrics.reduce((sum, m) => sum + m.totalTime, 0) / 
    validMetrics.reduce((sum, m) => sum + m.count, 0);
  
  const latestMetric = validMetrics[validMetrics.length - 1];
  const previousMetric = validMetrics[validMetrics.length - 2];
  const timeChange = previousMetric
    ? ((latestMetric.avgTime - previousMetric.avgTime) / previousMetric.avgTime) * 100
    : 0;

  // Calculate efficiency trend
  const avgTimes = validMetrics.map(m => m.avgTime);
  const trend = avgTimes.length > 1
    ? (avgTimes[avgTimes.length - 1] - avgTimes[0]) / avgTimes[0] * 100
    : 0;

  const data = {
    labels: dailyMetrics.map(m => m.date),
    datasets: [
      {
        label: 'Average Processing Time',
        data: dailyMetrics.map(m => m.avgTime),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Overall Average',
        data: Array(dailyMetrics.length).fill(overallAvgTime),
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
          <h4 className="text-sm font-medium mb-3">Daily Breakdown</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Avg Time</th>
                <th className="text-right py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {validMetrics.slice(-7).map(metric => (
                <tr key={metric.date} className="border-b last:border-0">
                  <td className="py-2">{metric.date}</td>
                  <td className="text-right">{metric.avgTime.toFixed(1)} min</td>
                  <td className="text-right">{metric.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Statistical Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Best Day:</span>
              <span className="font-medium">
                {validMetrics.reduce((best, m) => m.avgTime < best.avgTime ? m : best).date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Worst Day:</span>
              <span className="font-medium">
                {validMetrics.reduce((worst, m) => m.avgTime > worst.avgTime ? m : worst).date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Variation:</span>
              <span className="font-medium">
                {(validMetrics.reduce((sum, m) => sum + m.stdDev, 0) / validMetrics.length).toFixed(1)} min
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Processing Insights</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>
            Processing times show a {Math.abs(trend).toFixed(1)}% {trend > 0 ? 'increase' : 'decrease'} over the period
          </li>
          <li>
            Daily variations indicate {
              validMetrics.reduce((sum, m) => sum + m.stdDev, 0) / validMetrics.length > 15
                ? 'significant'
                : 'moderate'
            } processing time fluctuations
          </li>
          <li>
            Latest performance shows {Math.abs(timeChange).toFixed(1)}% {timeChange > 0 ? 'slower' : 'faster'} processing
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-6">Processing Time Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Current Average"
            value={`${latestMetric.avgTime.toFixed(1)} min`}
            subtitle="Latest day average"
            tooltip="Average processing time for the most recent day"
            trend={{ value: -timeChange, isPositive: timeChange <= 0 }}
            icon={Clock}
            colorClass="bg-indigo-50"
          />

          <MetricCard
            title="Overall Average"
            value={`${overallAvgTime.toFixed(1)} min`}
            subtitle="All-time average"
            tooltip="Average processing time across all transactions"
            icon={Activity}
            colorClass="bg-emerald-50"
          />

          <MetricCard
            title="Efficiency Trend"
            value={`${Math.abs(trend).toFixed(1)}%`}
            subtitle={trend <= 0 ? 'Faster' : 'Slower'}
            tooltip="Change in processing time over the entire period"
            trend={{ value: -trend, isPositive: trend <= 0 }}
            icon={TrendingUp}
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
                    const metric = dailyMetrics[context.dataIndex];
                    const lines = [`${label}: ${value.toFixed(1)} min`];
                    
                    if (metric && context.datasetIndex === 0) {
                      lines.push(
                        `Transactions: ${metric.count}`,
                        `Range: ${metric.minTime.toFixed(1)}-${metric.maxTime.toFixed(1)} min`
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
                  text: 'Processing Time (minutes)',
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
        title="Detailed Time Analysis"
        tooltip="View comprehensive processing time statistics and daily trends"
        defaultExpanded={false}
      >
        {detailedMetrics}
      </ExpandableSection>

      <div className="text-xs text-gray-500 space-y-1">
        <p>* Processing time is measured from transaction creation to funds availability</p>
        <p>* Daily averages are shown for days with at least one transaction</p>
        <p>* Hover over the chart for detailed daily metrics</p>
        <p>* Click on any value to copy it to your clipboard</p>
      </div>
    </div>
  );
}