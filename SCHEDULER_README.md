# Crypto Signal Schedulers

This project now has clean, well-structured separate schedulers for different types of technical analysis signals:

## 📁 File Structure

### 1. EMA Cross Scheduler (`services/emaCrossScheduler.ts`)

Handles all EMA (Exponential Moving Average) crossover signals and trend analysis.

**Features:**

- 9/21 EMA crossover detection
- 20/50 EMA crossover detection
- Trend reversal conditions
- Multiple timeframe monitoring (15m, 1h, 4h, 1d)

**Key Functions:**

- `emaCrossScheduler(bot)` - Main scheduler function
- `generateSignal(keyname, duration)` - Generate EMA cross signals
- `getSmallSignal(keyname, duration, emaShort, emaLong)` - Custom EMA cross signals
- `renderSignal(pairName, signals, bot, duration)` - Render signals to Telegram

### 2. RSI Scheduler (`services/rsiScheduler.ts`)

Handles RSI (Relative Strength Index) overbought and oversold conditions.

**Features:**

- RSI overbought detection (70+ and 80+ thresholds)
- RSI oversold detection (30- and 20- thresholds)
- Price away from EMA analysis
- Multiple timeframe monitoring

**Key Functions:**

- `rsiScheduler(bot)` - Main scheduler function
- `checkRSIOverbought(keyName, pairName, duration)` - Check overbought conditions
- `checkRSIOversold(keyName, pairName, duration)` - Check oversold conditions
- `getRSIStatus(keyName, duration)` - Get current RSI status
- `renderRSISignal(pairName, signals, bot, duration)` - Render RSI signals

## 🏗️ Code Structure

Both schedulers follow a clean, organized structure:

```
├── CONSTANTS & CONFIGURATION
│   ├── Trading pairs
│   ├── Thresholds
│   └── Scheduler intervals
├── INTERFACES & TYPES
│   ├── Signal interfaces
│   └── Type definitions
├── UTILITY FUNCTIONS
│   └── Helper functions
├── ANALYSIS FUNCTIONS
│   ├── Core analysis logic
│   └── Signal generation
├── SIGNAL RENDERING
│   └── Telegram message formatting
└── SCHEDULER FUNCTIONS
    ├── Processing functions
    ├── Interval setup
    └── Main scheduler
```

## 🚀 Usage

### Basic Usage

```typescript
import { Bot } from "grammy";
import { emaCrossScheduler } from "./services/emaCrossScheduler";
import { rsiScheduler } from "./services/rsiScheduler";

const bot = new Bot("YOUR_BOT_TOKEN");

// Initialize both schedulers
await emaCrossScheduler(bot);
await rsiScheduler(bot);
```

### Manual Signal Generation

```typescript
import { getRSIStatus } from "./services/rsiScheduler";
import { generateSignal } from "./services/emaCrossScheduler";

// Get RSI status for a specific pair
const rsiStatus = await getRSIStatus("BTCUSDT", "1h");
console.log(rsiStatus);

// Generate EMA signals manually
const emaSignals = await generateSignal("BTCUSDT", "1h");
console.log(emaSignals);
```

## ⚙️ Configuration

### RSI Thresholds

```typescript
const RSI_OVERBOUGHT_THRESHOLD = 70; // Standard overbought
const RSI_OVERSOLD_THRESHOLD = 30; // Standard oversold
const RSI_EXTREME_OVERBOUGHT = 80; // Extreme overbought
const RSI_EXTREME_OVERSOLD = 20; // Extreme oversold
```

### Scheduler Intervals

```typescript
// RSI Scheduler
const SCHEDULER_INTERVALS = {
  "15m": 5, // 15-minute analysis every 5 minutes
  "1h": 15, // 1-hour analysis every 15 minutes
  "4h": 60, // 4-hour analysis every 60 minutes
  "1d": 720, // Daily analysis every 12 hours
};

// EMA Scheduler
const SCHEDULER_INTERVALS = {
  "15m": 15, // 15-minute analysis every 15 minutes
  "1h": 60, // 1-hour analysis every 60 minutes
  "4h": 240, // 4-hour analysis every 4 hours
  "1d": 1440, // Daily analysis every 24 hours
};
```

### Supported Timeframes

- `15m` - 15 minutes
- `1h` - 1 hour
- `4h` - 4 hours
- `1d` - 1 day

### Default Trading Pairs

```typescript
const fallbackKeyPairs = ["BTCUSDT", "SOLUSDT", "SUIUSDT"];
```

## 📊 Signal Types

### EMA Cross Signals

- **EMA crossover 9/21** - Short-term trend changes
- **EMA crossover 20/50** - Medium-term trend changes
- **Trend reversal condition** - Potential trend reversals

### RSI Signals

- **RSI Overbought** - RSI ≥ 70, potential sell signal
- **RSI Extreme Overbought** - RSI ≥ 80, strong sell signal
- **RSI Oversold** - RSI ≤ 30, potential buy signal
- **RSI Extreme Oversold** - RSI ≤ 20, strong buy signal
- **Price in Overbought Zone** - Price significantly above EMA

## 🔄 Scheduling Intervals

### EMA Cross Scheduler

- **15-minute signals**: Every 15 minutes
- **1-hour signals**: Every 1 hour
- **4-hour signals**: Every 4 hours
- **Daily signals**: Every 24 hours

### RSI Scheduler

- **RSI overbought/oversold**: Every 5 minutes
- **Price away from EMA**: Every 15 minutes
- **Daily RSI analysis**: Every 12 hours

## 📝 Example Output

### EMA Signal

```
EMA Signal for BTCUSDT - 1h
Type: EMA crossover 9/21
Time: 1703123456789
Price: 84211.76
Details: 9 EMA crossed above 21 EMA, buy/long signal
```

### RSI Signal

```
RSI Signal for BTCUSDT - 1h
Type: BTCUSDT RSI Overbought
Time: 1703123456789
Price: 84211.76
RSI: 72.45
Details: RSI is overbought at 72.45, potential sell signal
```

## 🔧 Integration with Existing Code

The original `cryptoScheduler` function in `commandHandlers.ts` has been refactored to use the new separate schedulers:

```typescript
// EMA Cross Scheduler - moved to emaCrossScheduler.ts
export const cryptoScheduler = async (bot: Bot) => {
  await emaCrossScheduler(bot);
};

// RSI Scheduler - moved to rsiScheduler.ts
export const rsiOverboughtScheduler = async (bot: Bot) => {
  await rsiScheduler(bot);
};
```

## 🛠️ Error Handling

Both schedulers include comprehensive error handling:

- API call failures
- Invalid data responses
- Network timeouts
- Missing environment variables
- Individual pair processing errors

## 📈 Monitoring & Logging

Each scheduler includes detailed logging:

- Scheduler initialization
- Signal generation
- Error conditions
- Processing status
- Interval configuration

## 🧹 Code Quality Improvements

### Before (Messy Structure)

- Duplicate code
- Poor organization
- Mixed concerns
- Hard to maintain
- Redundant logging

### After (Clean Structure)

- ✅ Well-organized sections
- ✅ Clear separation of concerns
- ✅ Type safety with interfaces
- ✅ Comprehensive error handling
- ✅ Consistent logging
- ✅ Easy to maintain and extend
- ✅ Reusable functions
- ✅ Clean configuration management

## 🚀 Benefits of New Structure

1. **Maintainability**: Easy to modify individual components
2. **Readability**: Clear organization with comments
3. **Type Safety**: Strong TypeScript interfaces
4. **Error Handling**: Comprehensive error management
5. **Scalability**: Easy to add new features
6. **Testing**: Each function can be tested independently
7. **Documentation**: Self-documenting code structure
