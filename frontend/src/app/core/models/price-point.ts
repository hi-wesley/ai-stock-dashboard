/** Shape of a candle returned by our backend */
export interface PricePoint {
  date: number;   // JS epoch‑ms
  close: number;
  high : number;
  low  : number;
}
