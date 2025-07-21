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
  /* ----------------------- config ----------------------- */
  readonly RANGE    = '1mo';
  readonly INTERVAL = '1d';

  /* ----------------------- state ------------------------ */
  symbols: string[] = [];                                    // dynamic list
  priceSeries = new Map<string, Observable<PricePoint[]>>(); // chart data
  questionMap = new Map<string, FormControl>();              // one input per row
  answerMap   = new Map<string, Observable<string>>();       // one answer stream

  /* search bar */
  search = new FormControl('');

  constructor(
    private stocks: StockService,
    private chat: ChatService
  ) {}

  ngOnInit(): void {
    /* preload a few tickers */
    ['NVDA', 'GOOGL', 'SCHG'].forEach(t => this.addSymbol(t));
  }

  /* ---------------- add / remove symbols ---------------- */
  addSymbol(ticker?: string): void {
    const sym = (ticker ?? this.search.value)?.trim().toUpperCase();
    if (!sym || this.symbols.includes(sym)) return;

    /* update list & create per-row controls */
    this.symbols = [...this.symbols, sym];       // new reference → OnPush refresh
    this.questionMap.set(sym, new FormControl(''));

    /* fetch history (slice -100 to keep payload small) */
    const obs = this.stocks
      .getHistory(sym, this.RANGE, this.INTERVAL)
      .pipe(map(arr => arr.slice(-100)));

    this.priceSeries.set(sym, obs);
    this.search.reset();
  }

  removeSymbol(sym: string): void {
    this.symbols      = this.symbols.filter(s => s !== sym);
    this.priceSeries.delete(sym);
    this.questionMap .delete(sym);
    this.answerMap   .delete(sym);
  }

  /* -------------------------- chat -------------------------- */
  ask(sym: string): void {
    const control = this.questionMap.get(sym);
    if (!control) return;

    const q = control.value?.trim();
    if (!q) return;

    const series$ = this.priceSeries.get(sym) ?? of([]);

    const ans$ = series$.pipe(
      switchMap(series =>
        this.chat.ask(q, { symbol: sym, range: this.RANGE, series })
      ),
      map(r => r.answer)
    );

    this.answerMap.set(sym, ans$);
    control.reset();                    // clear the input after sending
  }
}
