import { Transaction } from '../types';
import { 
  TrendingUp, 
  Banknote, 
  ArrowUpDown,
  Info,
  HelpCircle,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { formatCurrency } from '../utils/data';
import { differenceInHours, format } from 'date-fns';

interface Props {
  transactions: Transaction[];
  isLoading?: boolean;
}

interface Metrics {
  totalVolume: number;
  avgTransactionSize: number;
  avgExchangeRate: number;
  exchangeRateCount: number;
  minExchangeRate: number;
  maxExchangeRate: number;
  hourlyDistribution: Record<number, number>;
  totalTransactions: number;
  smallTransactions: number;
  mediumTransactions: number;
  largeTransactions: number;
  processingTimes: number[];
  monthlyVolumes: Record<string, number>;
  totalUsdVolume: number;
  volumeWeightedRate: number;
  totalWeightedVolume: number;
  paymentPayoutPairs: {
    avgMatchingTime: number;
    maxMatchingTime: number;
    minMatchingTime: number;
  };
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  tooltip: string;
  icon: React.ReactNode;
  bgColor: string;
  isLoading?: boolean;
}

interface StatBoxProps {
  label: string;
  value: string;
  trend?: {
    value: number;
    previousValue: number;
    reverse?: boolean;
  };
  color?: string;
  className?: string;
  isLoading?: boolean;
}

function Tooltip({ content }: { content: string }) {
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

function TrendIndicator({ value, previousValue, reverse = false }: { value: number, previousValue: number, reverse?: boolean }) {
  const percentChange = ((value - previousValue) / previousValue) * 100;
  const isPositive = reverse ? percentChange < 0 : percentChange > 0;
  const isNeutral = percentChange === 0;

  return (
    <div className={`flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${
      isNeutral ? 'text-gray-500' : isPositive ? 'text-emerald-500' : 'text-rose-500'
    }`}>
      {isNeutral ? (
        <ArrowRight className="h-3 w-3 animate-pulse" />
      ) : isPositive ? (
        <ChevronUp className="h-3 w-3 animate-bounce" />
      ) : (
        <ChevronDown className="h-3 w-3 animate-bounce" />
      )}
      <span>{Math.abs(percentChange).toFixed(1)}%</span>
    </div>
  );
}

function ProgressBar({ 
  value, 
  max, 
  color = 'indigo',
  showValue = true,
  height = 'h-2',
  animate = true 
}: { 
  value: number;
  max: number;
  color?: 'indigo' | 'emerald' | 'blue' | 'purple' | 'rose' | 'yellow';
  showValue?: boolean;
  height?: string;
  animate?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`bg-gray-100 rounded-full overflow-hidden ${height}`}>
      <div 
        className={`h-full bg-${color}-500 rounded-full transition-all duration-1000 ease-out ${
          animate ? 'animate-progressBar' : ''
        }`}
        style={{ width: `${percentage}%` }}
      >
        {showValue && (
          <span className="text-xs text-white px-2">{percentage.toFixed(1)}%</span>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, tooltip, icon, bgColor, isLoading = false }: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-start">
        <div className={`p-3 rounded-full ${bgColor} transform transition-transform duration-200 hover:scale-110`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <Tooltip content={tooltip} />
          </div>
          <p className="text-xl font-bold mt-1 text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, tooltip }: { title: string; subtitle: string; tooltip: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <Tooltip content={tooltip} />
    </div>
  );
}

function StatBox({ 
  label, 
  value, 
  trend,
  color = 'blue',
  className = '',
  isLoading = false
}: StatBoxProps) {
  const baseClasses = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    purple: 'bg-purple-50 text-purple-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700'
  };

  const colorClasses = baseClasses[color as keyof typeof baseClasses] || baseClasses.blue;

  if (isLoading) {
    return (
      <div className={`${colorClasses} p-4 rounded-lg ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-current opacity-20 rounded w-1/2"></div>
          <div className="h-6 bg-current opacity-20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colorClasses} p-4 rounded-lg transform transition-all duration-200 hover:scale-105 ${className}`}>
      <h4 className="text-sm font-medium">{label}</h4>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {trend && (
        <div className="mt-2">
          <TrendIndicator {...trend} />
        </div>
      )}
    </div>
  );
}

export function TransactionMetrics({ transactions, isLoading = false }: Props) {
  const metrics = transactions.reduce((acc: Metrics, t) => {
    if (t.type === 'payment') {
      // Basic metrics
      acc.totalVolume += Math.abs(t.amount);
      acc.avgTransactionSize = acc.totalVolume / transactions.length;
      
      // Exchange rate calculations
      if (t.customerFacingAmount) {
        const rate = Math.abs(t.amount / t.customerFacingAmount);
        acc.avgExchangeRate += rate;
        acc.exchangeRateCount += 1;
        acc.minExchangeRate = acc.minExchangeRate === 0 ? rate : Math.min(acc.minExchangeRate, rate);
        acc.maxExchangeRate = Math.max(acc.maxExchangeRate, rate);
        acc.totalUsdVolume += t.customerFacingAmount;
        
        // Volume-weighted exchange rate
        acc.volumeWeightedRate += rate * t.customerFacingAmount;
        acc.totalWeightedVolume += t.customerFacingAmount;
      }

      // Time-based metrics
      const date = new Date(t.created);
      const month = format(date, 'MMM yyyy');
      const hour = date.getHours();
      acc.hourlyDistribution[hour] = (acc.hourlyDistribution[hour] || 0) + 1;
      acc.monthlyVolumes[month] = (acc.monthlyVolumes[month] || 0) + Math.abs(t.amount);

      // Processing time metrics
      const processingTime = differenceInHours(new Date(t.availableOn), new Date(t.created));
      acc.processingTimes.push(processingTime);

      // Amount ranges
      const amount = Math.abs(t.amount);
      if (amount < 10000) acc.smallTransactions += 1;
      else if (amount < 50000) acc.mediumTransactions += 1;
      else acc.largeTransactions += 1;

      acc.totalTransactions += 1;
    }
    return acc;
  }, {
    totalVolume: 0,
    avgTransactionSize: 0,
    avgExchangeRate: 0,
    exchangeRateCount: 0,
    minExchangeRate: 0,
    maxExchangeRate: 0,
    hourlyDistribution: {},
    totalTransactions: 0,
    smallTransactions: 0,
    mediumTransactions: 0,
    largeTransactions: 0,
    processingTimes: [],
    monthlyVolumes: {},
    totalUsdVolume: 0,
    volumeWeightedRate: 0,
    totalWeightedVolume: 0,
    paymentPayoutPairs: {
      avgMatchingTime: 0,
      maxMatchingTime: 0,
      minMatchingTime: 0
    }
  });

  // Calculate averages and trends
  const avgProcessingTime = Math.round(
    metrics.processingTimes.reduce((sum, time) => sum + time, 0) / metrics.processingTimes.length
  );
  const avgExchangeRate = metrics.avgExchangeRate / metrics.exchangeRateCount;
  const volumeWeightedExchangeRate = metrics.volumeWeightedRate / metrics.totalWeightedVolume;

  // Find peak transaction hour
  const peakHour = Object.entries(metrics.hourlyDistribution)
    .sort(([, a], [, b]) => Number(b) - Number(a))[0];
  const peakHourFormatted = `${peakHour[0]}:00`;

  // Calculate monthly growth
  const monthlyVolumes = Object.entries(metrics.monthlyVolumes)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
  const monthlyGrowth = monthlyVolumes.length > 1 
    ? ((monthlyVolumes[monthlyVolumes.length - 1][1] - monthlyVolumes[0][1]) / monthlyVolumes[0][1] * 100).toFixed(1)
    : '0';

  // Calculate processing time distribution
  const processingTimeDistribution = {
    fast: metrics.processingTimes.filter(t => t <= 24).length,
    medium: metrics.processingTimes.filter(t => t > 24 && t <= 48).length,
    slow: metrics.processingTimes.filter(t => t > 48).length,
  };

  // Calculate exchange rate volatility
  const exchangeRateVolatility = ((metrics.maxExchangeRate - metrics.minExchangeRate) / avgExchangeRate * 100).toFixed(1);

  // Additional financial metrics
  const previousMonthVolumes = Object.entries(metrics.monthlyVolumes)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  
  const currentMonthVolume = previousMonthVolumes[0]?.[1] || 0;
  const previousMonthVolume = previousMonthVolumes[1]?.[1] || 0;
  
  const volumeMetrics = {
    monthOverMonth: ((currentMonthVolume - previousMonthVolume) / previousMonthVolume) * 100,
    averageTicketSize: metrics.totalVolume / metrics.totalTransactions,
    volumePerDay: metrics.totalVolume / monthlyVolumes.length / 30,
    successRate: (metrics.totalTransactions / transactions.length) * 100
  };

  // Exchange rate trends
  const exchangeRateMetrics = {
    volatilityIndex: Number(exchangeRateVolatility),
    spreadPercentage: ((metrics.maxExchangeRate - metrics.minExchangeRate) / avgExchangeRate) * 100,
    weightedSpread: ((metrics.maxExchangeRate - metrics.minExchangeRate) / volumeWeightedExchangeRate) * 100
  };

  return (
    <div className="space-y-8">
      {/* Explanation Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-blue-100 rounded w-3/4"></div>
            <div className="h-4 bg-blue-100 rounded w-1/2"></div>
            <div className="h-4 bg-blue-100 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Key Dashboard Insights:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Payment Processing:</strong> Transactions typically take between {metrics.paymentPayoutPairs.minMatchingTime} to {metrics.paymentPayoutPairs.maxMatchingTime} hours from payment to payout
                </li>
                <li>
                  <strong>Exchange Rate Stability:</strong> The NGN/USD rate has fluctuated by {exchangeRateVolatility}% around the average, indicating {Number(exchangeRateVolatility) > 5 ? 'significant volatility' : 'relative stability'}
                </li>
                <li>
                  <strong>Peak Activity:</strong> Most transactions are processed at {peakHourFormatted} UTC, plan your payments accordingly
                </li>
                <li>
                  <strong>Market Rate:</strong> The current volume-weighted rate of ₦{volumeWeightedExchangeRate.toFixed(2)}/USD reflects actual market conditions better than simple averages
                </li>
              </ul>
            </div>
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Financial Health Indicators</h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-600">Month-over-Month Growth</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{volumeMetrics.monthOverMonth.toFixed(1)}%</span>
                  <TrendIndicator value={currentMonthVolume} previousValue={previousMonthVolume} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-600">Average Ticket Size</span>
                <span className="text-sm font-medium">
                  {formatCurrency(volumeMetrics.averageTicketSize, 'NGN')}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Exchange Rate Insights</h4>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-600">Rate Volatility</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{exchangeRateMetrics.volatilityIndex.toFixed(1)}%</span>
                  <TrendIndicator 
                    value={exchangeRateMetrics.volatilityIndex} 
                    previousValue={5} 
                    reverse={true}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-600">Rate Spread</span>
                <span className="text-sm font-medium">
                  {exchangeRateMetrics.spreadPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <SectionHeader 
          title="Primary Financial Metrics"
          subtitle="Key performance indicators for your platform"
          tooltip="These are the most important financial indicators showing overall platform performance and currency dynamics"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Volume"
            value={formatCurrency(metrics.totalVolume, 'NGN')}
            subtitle={`${formatCurrency(metrics.totalUsdVolume, 'USD')} total USD volume`}
            tooltip="Total amount of money processed through the platform in both NGN and USD"
            icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
            bgColor="bg-emerald-100"
            isLoading={isLoading}
          />
          <MetricCard
            title="Avg Transaction Size"
            value={formatCurrency(metrics.avgTransactionSize, 'NGN')}
            subtitle="Average amount per transaction"
            tooltip="Typical transaction size - helps understand the scale of regular payments"
            icon={<Banknote className="h-6 w-6 text-blue-600" />}
            bgColor="bg-blue-100"
            isLoading={isLoading}
          />
          <MetricCard
            title="Exchange Rate"
            value={`₦${volumeWeightedExchangeRate.toFixed(2)}/USD`}
            subtitle="Volume-weighted average rate"
            tooltip="Exchange rate weighted by transaction size - more accurate than simple average"
            icon={<ArrowUpDown className="h-6 w-6 text-purple-600" />}
            bgColor="bg-purple-100"
            isLoading={isLoading}
          />
          <MetricCard
            title="Monthly Growth"
            value={`${monthlyGrowth}%`}
            subtitle="Volume growth since first month"
            tooltip="Percentage increase in transaction volume compared to the first month"
            icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
            bgColor="bg-orange-100"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Processing Time Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <SectionHeader 
          title="Processing Time Analysis"
          subtitle="Payment processing efficiency breakdown"
          tooltip="Shows how quickly payments are processed. Green is fast (under 24h), Yellow is normal (24-48h), Red means delayed (over 48h)"
        />
        <div className="space-y-6">
          <div className="flex h-6 rounded-full overflow-hidden">
            <div 
              style={{ width: `${(processingTimeDistribution.fast / metrics.totalTransactions) * 100}%` }}
              className="bg-emerald-400 relative group transition-all duration-300 hover:brightness-110"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-xs text-white font-medium transition-opacity duration-200">
                ≤24h: {((processingTimeDistribution.fast / metrics.totalTransactions) * 100).toFixed(1)}%
              </div>
            </div>
            <div 
              style={{ width: `${(processingTimeDistribution.medium / metrics.totalTransactions) * 100}%` }}
              className="bg-yellow-400 relative group transition-all duration-300 hover:brightness-110"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-xs text-white font-medium transition-opacity duration-200">
                24-48h: {((processingTimeDistribution.medium / metrics.totalTransactions) * 100).toFixed(1)}%
              </div>
            </div>
            <div 
              style={{ width: `${(processingTimeDistribution.slow / metrics.totalTransactions) * 100}%` }}
              className="bg-red-400 relative group transition-all duration-300 hover:brightness-110"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-xs text-white font-medium transition-opacity duration-200">
                &gt;48h: {((processingTimeDistribution.slow / metrics.totalTransactions) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StatBox 
              label="Fast Processing"
              value={`${((processingTimeDistribution.fast / metrics.totalTransactions) * 100).toFixed(1)}%`}
              color="blue"
              trend={{
                value: processingTimeDistribution.fast,
                previousValue: metrics.totalTransactions / 3
              }}
              isLoading={isLoading}
            />
            <StatBox 
              label="Medium Processing"
              value={`${((processingTimeDistribution.medium / metrics.totalTransactions) * 100).toFixed(1)}%`}
              color="yellow"
              trend={{
                value: processingTimeDistribution.medium,
                previousValue: metrics.totalTransactions / 3
              }}
              isLoading={isLoading}
            />
            <StatBox 
              label="Slow Processing"
              value={`${((processingTimeDistribution.slow / metrics.totalTransactions) * 100).toFixed(1)}%`}
              color="red"
              trend={{
                value: processingTimeDistribution.slow,
                previousValue: metrics.totalTransactions / 3
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Exchange Rate Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <SectionHeader 
          title="Exchange Rate Dynamics"
          subtitle="Currency conversion analysis and trends"
          tooltip="Detailed analysis of exchange rate patterns and efficiency"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Rate Range Analysis</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Current Rate</span>
                    <span className="font-medium">₦{volumeWeightedExchangeRate.toFixed(2)}/USD</span>
                  </div>
                  <ProgressBar 
                    value={volumeWeightedExchangeRate}
                    max={metrics.maxExchangeRate}
                    color="emerald"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Average Rate</span>
                    <span className="font-medium">₦{avgExchangeRate.toFixed(2)}/USD</span>
                  </div>
                  <ProgressBar 
                    value={avgExchangeRate}
                    max={metrics.maxExchangeRate}
                    color="indigo"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Min Rate</span>
                    <span className="font-medium">₦{metrics.minExchangeRate.toFixed(2)}/USD</span>
                  </div>
                  <ProgressBar 
                    value={metrics.minExchangeRate}
                    max={metrics.maxExchangeRate}
                    color="purple"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Max Rate</span>
                    <span className="font-medium">₦{metrics.maxExchangeRate.toFixed(2)}/USD</span>
                  </div>
                  <ProgressBar 
                    value={metrics.maxExchangeRate}
                    max={metrics.maxExchangeRate}
                    color="rose"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Rate Volatility</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Rate Volatility</span>
                  <span className="font-medium">{exchangeRateVolatility}%</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Rate Spread</span>
                  <span className="font-medium">{exchangeRateMetrics.spreadPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Weighted Spread</span>
                  <span className="font-medium">{exchangeRateMetrics.weightedSpread.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Size Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Payment Size Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">
              Breakdown of transactions by amount size
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Total: {metrics.totalTransactions} transactions
            </span>
            <Tooltip content="Shows the distribution of transaction sizes. Small (under ₦10k), Medium (₦10k-₦50k), and Large (over ₦50k)" />
          </div>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div 
            style={{ width: `${(metrics.smallTransactions / metrics.totalTransactions) * 100}%` }}
            className="bg-blue-400"
            title={`Small Transactions (< ₦10,000): ${metrics.smallTransactions}`}
          />
          <div 
            style={{ width: `${(metrics.mediumTransactions / metrics.totalTransactions) * 100}%` }}
            className="bg-blue-600"
            title={`Medium Transactions (₦10,000 - ₦50,000): ${metrics.mediumTransactions}`}
          />
          <div 
            style={{ width: `${(metrics.largeTransactions / metrics.totalTransactions) * 100}%` }}
            className="bg-blue-800"
            title={`Large Transactions (> ₦50,000): ${metrics.largeTransactions}`}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Small (&lt;₦10k): {((metrics.smallTransactions / metrics.totalTransactions) * 100).toFixed(1)}%</span>
          <span>Medium (₦10k-₦50k): {((metrics.mediumTransactions / metrics.totalTransactions) * 100).toFixed(1)}%</span>
          <span>Large (&gt;₦50k): {((metrics.largeTransactions / metrics.totalTransactions) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Monthly Volume Trend */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Monthly Growth Trend</h3>
            <p className="text-sm text-gray-500 mt-1">
              How transaction volume has changed month over month
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {Number(monthlyGrowth) > 0 
                ? `Growing trend with ${monthlyGrowth}% increase since start` 
                : `Declining trend with ${Math.abs(Number(monthlyGrowth))}% decrease since start`}
            </p>
          </div>
          <Tooltip content="Shows the trend in transaction volumes. Longer bars indicate higher volume months. Use this to identify growth patterns and seasonality." />
        </div>
        <div className="space-y-3">
          {monthlyVolumes.map(([month, volume]) => (
            <div key={month} className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{month}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-medium">{formatCurrency(volume, 'NGN')}</span>
                  {monthlyVolumes.indexOf([month, volume]) > 0 && (
                    <span className={`text-xs ${
                      volume > monthlyVolumes[monthlyVolumes.indexOf([month, volume]) - 1][1]
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      ({((volume - monthlyVolumes[monthlyVolumes.indexOf([month, volume]) - 1][1]) / 
                         monthlyVolumes[monthlyVolumes.indexOf([month, volume]) - 1][1] * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ 
                    width: `${(volume / Math.max(...monthlyVolumes.map(([,v]) => v))) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Volume Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Transaction Volume Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive breakdown of transaction volumes and patterns
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Daily Average: {formatCurrency(metrics.totalVolume / monthlyVolumes.length / 30, 'NGN')}
            </p>
          </div>
          <Tooltip content="Analyzes transaction volumes across different time periods and segments to identify patterns and anomalies." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Volume Distribution</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Total NGN Volume</span>
                  <span>{formatCurrency(metrics.totalVolume, 'NGN')}</span>
                </div>
                <div className="h-2 bg-emerald-100 rounded-full" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Total USD Volume</span>
                  <span>{formatCurrency(metrics.totalUsdVolume, 'USD')}</span>
                </div>
                <div className="h-2 bg-blue-100 rounded-full" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Average Daily Volume</span>
                  <span>{formatCurrency(metrics.totalVolume / monthlyVolumes.length / 30, 'NGN')}</span>
                </div>
                <div className="h-2 bg-purple-100 rounded-full" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Key Volume Metrics</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Monthly Average</p>
                  <p className="text-sm font-medium mt-1">
                    {formatCurrency(metrics.totalVolume / monthlyVolumes.length, 'NGN')}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Largest Transaction</p>
                  <p className="text-sm font-medium mt-1">
                    {formatCurrency(Math.max(...transactions.map(t => Math.abs(t.amount))), 'NGN')}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Average Size</p>
                  <p className="text-sm font-medium mt-1">
                    {formatCurrency(metrics.avgTransactionSize, 'NGN')}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Count</p>
                  <p className="text-sm font-medium mt-1">
                    {metrics.totalTransactions} transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* USD Transaction Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">USD Transaction Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">
              Analysis of transactions in USD equivalent values
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Average USD Transaction: {formatCurrency(metrics.totalUsdVolume / metrics.totalTransactions, 'USD')}
            </p>
          </div>
          <Tooltip content="Provides insights into transaction patterns when viewed in USD, helping understand the international value of payments." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700">Small USD Transactions</h4>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {((transactions.filter(t => t.customerFacingAmount && t.customerFacingAmount <= 50).length / 
                transactions.filter(t => t.customerFacingAmount !== null).length) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-blue-600 mt-1">&lt; $50 USD</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-700">Medium USD Transactions</h4>
            <p className="text-2xl font-bold text-indigo-800 mt-1">
              {((transactions.filter(t => t.customerFacingAmount && t.customerFacingAmount > 50 && t.customerFacingAmount <= 100).length / 
                transactions.filter(t => t.customerFacingAmount !== null).length) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-indigo-600 mt-1">$50 - $100 USD</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-700">Large USD Transactions</h4>
            <p className="text-2xl font-bold text-purple-800 mt-1">
              {((transactions.filter(t => t.customerFacingAmount && t.customerFacingAmount > 100).length / 
                transactions.filter(t => t.customerFacingAmount !== null).length) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-purple-600 mt-1">&gt; $100 USD</p>
          </div>
        </div>
      </div>

      {/* Financial Performance Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Financial Performance Metrics</h3>
            <p className="text-sm text-gray-500 mt-1">
              Key performance indicators and comparative analysis
            </p>
          </div>
          <Tooltip content="Comprehensive financial metrics showing performance trends and comparisons" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-600">Volume Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Daily Average</span>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(volumeMetrics.volumePerDay, 'NGN')}
                  </p>
                  <TrendIndicator 
                    value={volumeMetrics.volumePerDay} 
                    previousValue={metrics.totalVolume / (monthlyVolumes.length + 1) / 30}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Monthly Trend</span>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {volumeMetrics.monthOverMonth > 0 ? '+' : ''}{volumeMetrics.monthOverMonth.toFixed(1)}%
                  </p>
                  <TrendIndicator value={currentMonthVolume} previousValue={previousMonthVolume} />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-600">Exchange Rate Analysis</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Rate Efficiency</span>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {(exchangeRateMetrics.weightedSpread / exchangeRateMetrics.spreadPercentage * 100).toFixed(1)}%
                  </p>
                  <TrendIndicator 
                    value={exchangeRateMetrics.weightedSpread} 
                    previousValue={exchangeRateMetrics.spreadPercentage}
                    reverse={true}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Market Alignment</span>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {((volumeWeightedExchangeRate / avgExchangeRate) * 100).toFixed(1)}%
                  </p>
                  <TrendIndicator 
                    value={volumeWeightedExchangeRate} 
                    previousValue={avgExchangeRate}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-600">Processing Efficiency</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Processing</span>
                <div className="text-right">
                  <p className="text-sm font-medium">{avgProcessingTime}h</p>
                  <TrendIndicator 
                    value={48 - avgProcessingTime} 
                    previousValue={48 - metrics.processingTimes[metrics.processingTimes.length - 1]}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fast Processing Rate</span>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {((processingTimeDistribution.fast / metrics.totalTransactions) * 100).toFixed(1)}%
                  </p>
                  <TrendIndicator 
                    value={processingTimeDistribution.fast} 
                    previousValue={metrics.totalTransactions / 3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Comparative Analysis Section */}
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Comparative Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">
              Performance metrics compared to platform averages and targets
            </p>
          </div>
          <Tooltip content="Compares current performance metrics against historical averages and industry benchmarks" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-4">Volume Performance</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Current vs Average Volume</span>
                  <span className="font-medium">
                    {((currentMonthVolume / (metrics.totalVolume / monthlyVolumes.length)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ 
                      width: `${Math.min(((currentMonthVolume / (metrics.totalVolume / monthlyVolumes.length)) * 100), 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Processing Time Efficiency</span>
                  <span className="font-medium">
                    {((48 - avgProcessingTime) / 48 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ 
                      width: `${((48 - avgProcessingTime) / 48 * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-4">Rate Efficiency</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Exchange Rate Optimization</span>
                  <span className="font-medium">
                    {(100 - exchangeRateMetrics.volatilityIndex).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ 
                      width: `${100 - exchangeRateMetrics.volatilityIndex}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Transaction Size Efficiency</span>
                  <span className="font-medium">
                    {((metrics.avgTransactionSize / Math.max(...transactions.map(t => Math.abs(t.amount)))) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ 
                      width: `${(metrics.avgTransactionSize / Math.max(...transactions.map(t => Math.abs(t.amount)))) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}