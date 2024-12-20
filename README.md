# Stripe Payments Analytics Dashboard

A modern, interactive dashboard for analyzing Stripe payment transactions with detailed metrics, trends, and insights. Built with React, TypeScript, and Tailwind CSS.

## Features

### Transaction Analytics
- **Monthly Volume Trends**: Track payment volume changes over time with growth indicators
- **Transaction Velocity**: Monitor transaction frequency and peak processing times
- **Processing Efficiency**: Analyze payment processing times with distribution metrics
- **Exchange Rate Analysis**: Track NGN/USD exchange rate trends and volatility
- **Transaction Size Distribution**: Visualize payment amounts across different segments

### Key Metrics
- Total transaction volume in NGN and USD
- Average transaction size
- Volume-weighted exchange rates
- Processing time distribution
- Monthly growth trends
- Transaction success rates

### Interactive Features
- 📊 Interactive charts with hover states
- 📋 Click-to-copy functionality for numeric values
- 🔍 Detailed tooltips for all metrics
- 📈 Expandable sections for in-depth analysis
- 🎨 Modern, responsive design

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Payment Processing**: Stripe API

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stripe-payments-analytics.git
cd stripe-payments-analytics
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your Stripe API keys and other configuration
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/           # React components
│   ├── TransactionMetrics.tsx    # Main metrics component
│   ├── CurrencyDistributionChart.tsx
│   ├── ExchangeRateAnalysis.tsx
│   └── ...
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx             # Main application component
```

## Features in Detail

### Transaction Metrics
- Comprehensive analysis of transaction volumes
- Trend indicators for key metrics
- Comparative analysis with historical data
- Processing time distribution visualization

### Exchange Rate Analysis
- Volume-weighted average rates
- Exchange rate volatility metrics
- Spread analysis and trends
- Rate efficiency indicators

### Financial Insights
- Month-over-month growth analysis
- Average ticket size tracking
- Transaction size segmentation
- Peak activity patterns

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/) 