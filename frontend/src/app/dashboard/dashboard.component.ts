import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, switchMap, map } from 'rxjs';

import { StockService } from '../core/services/stock.service';
import { ChatService } from '../core/services/chat.service';
import { PricePoint } from '../core/models/price-point';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  /** User-selected tickers */
  symbols: string[] = [];

  /** Fixed range / interval (adjust if desired) */
  private readonly RANGE = '1mo';
  private readonly INTERVAL = '1d';

  /** Map<ticker, Observable<PricePoint[]>> */
  priceSeries = new Map<string, Observable<PricePoint[]>>();

  /* ---------------- form controls ---------------- */
  search   = new FormControl('');
  question = new FormControl('');
  answer$?: Observable<string>;

  constructor(private stocks: StockService, private chat: ChatService) {}

  ngOnInit(): void {
    /* Optionally preload a few tickers */
    ['NVDA', 'GOOGL', 'SCHG'].forEach(t => this.fetchSeries(t));
  }

  /* ---------- add / remove tickers ---------- */
  addSymbol(): void {
    const sym = this.search.value?.trim().toUpperCase();
    if (!sym || this.symbols.includes(sym)) return;

    this.symbols = [...this.symbols, sym];  // new reference for OnPush
    this.fetchSeries(sym);
    this.search.reset();
  }

  removeSymbol(sym: string): void {
    this.symbols = this.symbols.filter(s => s !== sym);
    this.priceSeries.delete(sym);
  }

  /* ---------- data fetch ---------- */
  private fetchSeries(sym: string): void {
    const obs = this.stocks
      .getHistory(sym, this.RANGE, this.INTERVAL)
      .pipe(map(list => list.slice(-100)));   // send ≤100 pts to AI

    this.priceSeries.set(sym, obs);
  }

  /* ---------- chat ---------- */
  ask(sym: string): void {
    const q = this.question.value?.trim();
    if (!q) return;

    const series$ = this.priceSeries.get(sym) ?? of([]);
    this.answer$ = series$.pipe(
      switchMap(series =>
        this.chat.ask(q, {
          symbol: sym,
          range: this.RANGE,
          series
        })
      ),
      map(r => r.answer)
    );
  }
}
