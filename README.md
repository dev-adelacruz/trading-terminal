# ETH Trading Terminal

A modern, responsive React-based trading dashboard for managing ETH/USD positions with real-time profit/loss calculations and local persistence.

## 🚀 Overview

ETH Trading Terminal is a web-based dashboard designed for cryptocurrency traders to manage their ETH/USD positions. It provides real-time profit/loss calculations, position management, and portfolio analytics with a clean, modern interface built using React and Tailwind CSS.

![Dashboard Preview](https://via.placeholder.com/800x450.png?text=ETH+Trading+Terminal+Dashboard)

## ✨ Features

### 📊 Real-time Position Management
- **Add/Edit/Delete Positions**: Manage buy/sell positions with inline editing
- **Exclude from Calculations**: Toggle position inclusion in P/L calculations
- **Global Pip Value**: Adjustable pip multiplier for all positions
- **LocalStorage Persistence**: All data persists across browser sessions

### 📈 Advanced Analytics
- **Global Floating P/L**: Real-time profit/loss calculations
- **Average Position Price**: Weighted average of all active positions
- **Active Exposure**: Total lot size across all positions
- **Per-position P/L**: Individual trade profit/loss display

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Inline Editing**: Edit positions directly in the table
- **Modal Forms**: Clean modal interface for adding new positions
- **Real-time Updates**: Instant calculation updates as values change
- **Visual Indicators**: Color-coded P/L and side indicators

## 🛠️ Technology Stack

- **React 19.2.0** - Frontend library
- **Vite 7.2.4** - Build tool and dev server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Lucide React 0.562.0** - Icon library
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📁 Project Structure

```
trading-terminal/
├── public/              # Static assets
├── src/
│   ├── App.jsx         # Main application component
│   ├── App.css         # Application styles
│   ├── index.css       # Global Tailwind styles
│   ├── main.jsx        # Application entry point
│   └── assets/         # Image assets
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── eslint.config.js    # ESLint configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd trading-terminal
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📖 Usage Guide

### Managing Positions

1. **Adding a New Position**
   - Click the "New Position" button
   - Select BUY or SELL
   - Enter Entry Price and Lot Size
   - Click "Confirm Order"

2. **Editing a Position**
   - Click the pencil icon (✏️) on any position
   - Modify the Side, Entry Price, or Lot Size inline
   - Click the save icon (✓) to confirm or X to cancel

3. **Excluding/Including Positions**
   - Click the eye icon (👁️) to exclude a position from calculations
   - Click the eye-off icon (👁️‍🗨️) to include it again

4. **Removing Positions**
   - Click the trash icon (🗑️) to delete a position
   - *Note: No confirmation dialog is shown*

### Adjusting Market Data

1. **Current ETH Price**
   - Edit the price in the header's "Live ETH Price" input
   - Use the up/down arrows to adjust by $5 increments

2. **Global Pip Value**
   - Adjust the "Pip Value" in the positions table header
   - This value multiplies all P/L calculations

## 🧮 Calculation Methodology

### Profit/Loss Formula
```
P/L = (Current Price - Entry Price) × Direction Multiplier × Lot Size × Pip Value

Where:
- Direction Multiplier: 1 for BUY, -1 for SELL
- Pip Value: Global multiplier (default: $1.00)
```

### Aggregate Statistics
- **Total P/L**: Sum of P/L for all non-excluded positions
- **Average Entry Price**: Weighted average by lot size
- **Total Invested**: Sum of (Entry Price × Lot Size) for all positions
- **Average P/L %**: (Total P/L ÷ Total Invested) × 100

## 🔧 Technical Implementation

### State Management
The application uses React hooks for state management:
- `useState` for local component state
- `useMemo` for performance-optimized calculations
- `useEffect` for LocalStorage persistence

### Data Persistence
Three key values are persisted to LocalStorage:
- `eth_terminal_trades`: Array of all positions
- `eth_terminal_price`: Current ETH price
- `eth_terminal_pip_value`: Global pip multiplier

### Performance Optimizations
- Memoized statistics calculations prevent unnecessary recalculations
- Efficient rendering with conditional formatting
- Lazy loading for icons and components

## 📱 Responsive Design

The application is fully responsive:
- **Desktop (≥1024px)**: Full table view with all columns
- **Tablet (768px-1023px)**: Optimized table with adjusted spacing
- **Mobile (<768px)**: Stacked layout with horizontal table scrolling

## 🔮 Future Improvements

### Planned Features
- [ ] Real-time market data integration via WebSocket
- [ ] Multiple trading pairs (BTC/USD, SOL/USD, etc.)
- [ ] Advanced charting with TradingView integration
- [ ] User authentication and cloud sync
- [ ] Export/import position data (CSV, JSON)
- [ ] Risk management tools (stop-loss, take-profit)

### Technical Enhancements
- [ ] Add TypeScript for type safety
- [ ] Implement state management (Redux/Zustand)
- [ ] Add unit and integration tests
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement error boundaries and error handling

## 🐛 Known Issues

1. **No input validation** for negative lot sizes or prices
2. **Delete operations** have no confirmation dialog
3. **Excluded positions** still appear in "Active Positions" table
4. **Limited to ETH/USD** pair only
5. **Manual price updates** required (no live feed)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and formatting
- Add comments for complex logic
- Update documentation for new features
- Test changes thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Create Vite](https://vite.dev/guide/) - Project template

---

**Built with ❤️ for the trading community**
