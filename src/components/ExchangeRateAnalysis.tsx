import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { DollarSign, Activity } from 'lucide-react';
import { MetricCard, ExpandableSection } from './shared/UIComponents';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  ChartTooltip, 
  Legend,
  Filler
);

interface Props {
  transactions: Transaction[];
}

interface ExchangeRateData {
  date: string;
  rate: number;
  volume: number;
  rawDate: Date;
  count: number;
}

interface RateMetrics {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  volatility: number;
}

function calculateRateMetrics(rates: number[]): RateMetrics {
  const sortedRates = [...rates].sort((a, b) => a - b);
  const mean = rates.reduce((sum, r) => sum + r, 0) / rates.length;
  const median = sortedRates[Math.floor(rates.length / 2)];
  const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const volatility = (stdDev / mean) * 100;

  return { mean, median, stdDev, min, max, volatility };
}

export function ExchangeRateAnalysis({ transactions }: Props) {
  const exchangeRates: ExchangeRateData[] = transactions
    .filter(t => t.customerFacingAmount && t.customerFacingCurrency === 'usd')
    .map(t => ({
      date: format(parseISO(t.created), 'MMM dd'),
      rate: Math.abs(t.amount / (t.customerFacingAmount || 1)),
      volume: Math.abs(t.customerFacingAmount || 0),
      count: 1,
      rawDate: parseISO(t.created)
    }))
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

  // Calculate trends and statistics
  const latestRate = exchangeRates[exchangeRates.length - 1]?.rate || 0;
  const previousRate = exchangeRates[exchangeRates.length - 2]?.rate || latestRate;
  const rateChange = ((latestRate - previousRate) / previousRate) * 100;

  const rates = exchangeRates.map(r => r.rate);
  const metrics = calculateRateMetrics(rates);

  const volumeWeightedRate = exchangeRates.reduce((sum, r) => sum + r.rate * r.volume, 0) / 
    exchangeRates.reduce((sum, r) => sum + r.volume, 0);

  // Calculate moving averages
  const movingAverageWindow = 5;
  const movingAverages = exchangeRates.map((_, index, arr) => {
    if (index < movingAverageWindow - 1) return null;
    const window = arr.slice(index - movingAverageWindow + 1, index + 1);
    return window.reduce((sum, r) => sum + r.rate, 0) / movingAverageWindow;
  });

  const data = {
    labels: exchangeRates.map(r => r.date),
    datasets: [
      {
        label: 'NGN/USD Rate',
        data: exchangeRates.map(r => r.rate),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Volume-Weighted Average',
        data: Array(exchangeRates.length).fill(volumeWeightedRate),
        borderColor: 'rgba(34, 197, 94, 0.5)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: '5-Day Moving Average',
        data: movingAverages,
        borderColor: 'rgba(249, 115, 22, 0.5)',
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const detailedMetrics = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Rate Distribution Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Median Rate:</span>
              <span className="font-medium">₦{metrics.median.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Standard Deviation:</span>
              <span className="font-medium">₦{metrics.stdDev.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rate Range:</span>
              <span className="font-medium">
                ₦{metrics.min.toFixed(2)} - ₦{metrics.max.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Volatility:</span>
              <span className="font-medium">{metrics.volatility.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Volume-Weighted Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Simple Average:</span>
              <span className="font-medium">₦{metrics.mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weighted Average:</span>
              <span className="font-medium">₦{volumeWeightedRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difference:</span>
              <span className="font-medium">
                {((volumeWeightedRate - metrics.mean) / metrics.mean * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-3">Rate Movement Insights</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>
            The exchange rate shows a {Math.abs(metrics.volatility)}% volatility over the period
          </li>
          <li>
            Volume-weighted average is {volumeWeightedRate > metrics.mean ? 'higher' : 'lower'} than simple average,
            indicating larger transactions tend to occur at {volumeWeightedRate > metrics.mean ? 'higher' : 'lower'} rates
          </li>
          <li>
            Rate movement trend is {rateChange > 0 ? 'upward' : 'downward'} with {Math.abs(rateChange).toFixed(1)}% change
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-6">Exchange Rate Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Current Rate"
            value={`₦${latestRate.toFixed(2)}/USD`}
            subtitle="Latest exchange rate"
            tooltip="Most recent NGN/USD exchange rate from transactions"
            trend={{ value: rateChange, isPositive: rateChange <= 0 }}
            icon={DollarSign}
            colorClass="bg-indigo-50"
          />

          <MetricCard
            title="Volatility"
            value={`${metrics.volatility.toFixed(1)}%`}
            subtitle="Rate standard deviation"
            tooltip="Measure of exchange rate variability over the period"
            icon={Activity}
            colorClass="bg-emerald-50"
          />

          <MetricCard
            title="Weighted Average"
            value={`₦${volumeWeightedRate.toFixed(2)}/USD`}
            subtitle="Volume-adjusted rate"
            tooltip="Exchange rate weighted by transaction volumes"
            icon={DollarSign}
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
              intersect: false,
              mode: 'index'
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
                    const value = context.parsed.y;
                    const rate = exchangeRates[context.dataIndex];
                    const lines = [`${label}: ₦${value.toFixed(2)}`];
                    
                    if (rate && context.datasetIndex === 0) {
                      lines.push(`Volume: ${rate.volume.toLocaleString('en-US', {
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
                title: {
                  display: true,
                  text: 'NGN/USD Rate',
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
        title="Detailed Rate Analysis"
        tooltip="View comprehensive exchange rate statistics and insights"
        defaultExpanded={false}
      >
        {detailedMetrics}
      </ExpandableSection>

      <div className="text-xs text-gray-500 space-y-1">
        <p>* Rate volatility is calculated as the standard deviation relative to the mean</p>
        <p>* Volume-weighted average accounts for transaction sizes in rate calculation</p>
        <p>* Moving average helps identify underlying rate trends</p>
        <p>* Click on any value to copy it to your clipboard</p>
      </div>
    </div>
  );
}