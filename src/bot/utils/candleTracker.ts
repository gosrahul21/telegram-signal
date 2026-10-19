/**
 * In-memory tracker to prevent duplicate Telegram alerts for the same candle across scheduler iterations.
 */
class CandleTracker {
  // Map of cacheKey (`${pairName}:${duration}:${signalType}`) -> candleId (timestamp or ISO string)
  private alertedCandles: Map<string, string | number> = new Map();

  /**
   * Generates a cache key for tracking.
   */
  public getKey(pairName: string, duration: string, signalType: string): string {
    return `${pairName}:${duration}:${signalType}`;
  }

  /**
   * Extracts a unique candle ID (timestamp or string) from candle data.
   */
  public getCandleId(candle: any): string | number {
    if (!candle) return "";
    return candle.closeTime ?? candle.openTime ?? candle.time ?? "";
  }

  /**
   * Checks if an alert has already been sent for the given candle and signal.
   */
  public isCandleAlerted(key: string, candleId: string | number): boolean {
    if (!candleId) return false;
    const lastAlertedId = this.alertedCandles.get(key);
    return lastAlertedId !== undefined && String(lastAlertedId) === String(candleId);
  }

  /**
   * Records that an alert was sent for this candle.
   */
  public recordCandleAlert(key: string, candleId: string | number): void {
    if (candleId) {
      this.alertedCandles.set(key, candleId);
    }
  }

  /**
   * Clears the alert record for a key or all keys.
   */
  public clear(key?: string): void {
    if (key) {
      this.alertedCandles.delete(key);
    } else {
      this.alertedCandles.clear();
    }
  }
}

export const candleTracker = new CandleTracker();
export default candleTracker;
