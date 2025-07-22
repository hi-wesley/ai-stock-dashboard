import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, switchMap, map } from 'rxjs';

import { StockService } from '../core/services/stock.service';
import { ChatService } from '../core/services/chat.service';
import { PricePoint } from '../core/models/price-point';

type Range =
  | '1d' | '5d' | '1mo' | '6mo' | '1y' | '5y' | 'max';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  /* ---------- state ---------- */
  symbols: string[] = [];                                 // dynamic list
  priceSeries = new Map<string, Observable<PricePoint[]>>();
  rangeMap    = new Map<string, Range>();
  questionMap = new Map<string, FormControl>();
  answerMap   = new Map<string, Observable<string>>();

  /* search bar */
  search = new FormControl('');

  /* fixed order of range buttons */
  readonly ranges: Range[] = ['1d', '5d', '1mo', '6mo', '1y', '5y', 'max'];

  constructor(
    private stocks: StockService,
    private chat:   ChatService
  ) {}

  ngOnInit(): void {
    /* ✨ only preload NVDA */
    this.addSymbol('NVDA');
  }

  /* ------------- add / remove symbols ------------- */
  addSymbol(raw?: string): void {
    const sym = (raw ?? this.search.value)?.trim().toUpperCase();
    if (!sym || this.symbols.includes(sym)) return;

    this.symbols = [...this.symbols, sym];    // new reference → OnPush
    this.rangeMap.set(sym, '1mo');            // default
    this.questionMap.set(sym, new FormControl(''));

    this.fetchSeries(sym);
    this.search.reset();
  }

  removeSymbol(sym: string): void {
    this.symbols = this.symbols.filter(s => s !== sym);
    this.priceSeries.delete(sym);
    this.rangeMap.delete(sym);
    this.questionMap.delete(sym);
    this.answerMap.delete(sym);
  }

  /* ------------- data fetch ------------- */
  private fetchSeries(sym: string): void {
    const range = this.rangeMap.get(sym) ?? '1mo';
    const interval = this.pickInterval(range);

    const obs = this.stocks
      .getHistory(sym, range, interval)
      .pipe(map(arr => arr.slice(-100)));   // keep AI payload small

    this.priceSeries.set(sym, obs);
  }

  /** Simple heuristic mapping range → interval */
  private pickInterval(r: Range): string {
    switch (r) {
      case '1d':  return '5m';
      case '5d':  return '15m';
      case '1mo': return '1d';
      case '6mo': return '1d';
      case '1y':  return '1wk';
      case '5y':  return '1wk';
      case 'max': return '1mo';
    }
  }

  setRange(sym: string, r: Range): void {
    if (this.rangeMap.get(sym) === r) return;
    this.rangeMap.set(sym, r);
    this.fetchSeries(sym);
  }

  /* ------------- chat ------------- */
  ask(sym: string): void {
    const control = this.questionMap.get(sym);
    if (!control) return;

    const q = control.value?.trim();
    if (!q) return;

    const range = this.rangeMap.get(sym) ?? '1mo';
    const series$ = this.priceSeries.get(sym) ?? of([]);

    const ans$ = series$.pipe(
      switchMap(series =>
        this.chat.ask(q, { symbol: sym, range, series })
      ),
      map(r => r.answer)
    );

    this.answerMap.set(sym, ans$);
    control.reset();
  }
}
