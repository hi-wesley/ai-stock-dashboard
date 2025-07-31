import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, switchMap, map, tap, startWith } from 'rxjs';

import { StockService } from '../core/services/stock.service';
import { ChatService } from '../core/services/chat.service';
import { PricePoint } from '../core/models/price-point';

type Range =
  | '1d' | '5d' | '1mo' | '6mo' | '1y' | '5y' | 'max';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DashboardComponent implements OnInit {
  /* ---------- state ---------- */
  symbols: string[] = [];                                 // dynamic list
  priceSeries = new Map<string, Observable<PricePoint[]>>();
  rangeMap    = new Map<string, Range>();
  questionMap = new Map<string, FormControl>();
  answerMap   = new Map<string, Observable<string>>();
  loadingMap  = new Map<string, boolean>();              // track loading state
  cachedData  = new Map<string, PricePoint[]>();         // cache last loaded data
  savedAnswers = new Map<string, string>();              // persistent AI answers

  /* search bar */
  search = new FormControl('');

  /* fixed order of range buttons */
  readonly ranges: Range[] = ['1d', '5d', '1mo', '6mo', '1y', '5y', 'max'];

  /* display labels for range buttons */
  readonly rangeLabels: Record<Range, string> = {
    '1d': '1 Day',
    '5d': '5 Days',
    '1mo': '1 Month',
    '6mo': '6 Months',
    '1y': '1 Year',
    '5y': '5 Years',
    'max': 'All Time'
  };

  constructor(
    private stocks: StockService,
    private chat:   ChatService,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load saved answers from localStorage
    this.loadSavedAnswers();
    
    /* ✨ only preload GOOGL */
    this.addSymbol('GOOGL');
  }

  private loadSavedAnswers(): void {
    const saved = localStorage.getItem('ai-stock-answers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([key, value]) => {
          this.savedAnswers.set(key, value as string);
        });
      } catch (e) {
        console.warn('Failed to parse saved answers:', e);
      }
    }
  }

  /* ------------- add / remove symbols ------------- */
  addSymbol(raw?: string): void {
    const sym = (raw ?? this.search.value)?.trim().toUpperCase();
    if (!sym || this.symbols.includes(sym)) return;

    this.symbols = [...this.symbols, sym];    // new reference → OnPush
    this.rangeMap.set(sym, '5y');            // default
    this.questionMap.set(sym, new FormControl(''));

    // Restore saved answer if available
    const savedAnswer = this.savedAnswers.get(sym);
    if (savedAnswer) {
      this.answerMap.set(sym, of(savedAnswer));
    }

    this.fetchSeries(sym);
    this.search.reset();
  }

  removeSymbol(sym: string): void {
    this.symbols = this.symbols.filter(s => s !== sym);
    this.priceSeries.delete(sym);
    this.rangeMap.delete(sym);
    this.questionMap.delete(sym);
    this.answerMap.delete(sym);
    this.loadingMap.delete(sym);
    this.cachedData.delete(sym);
    
    // Remove from saved answers
    this.savedAnswers.delete(sym);
    this.saveAnswersToLocalStorage();
  }

  /* ------------- data fetch ------------- */
  private fetchSeries(sym: string): void {
    const range = this.rangeMap.get(sym) ?? '1mo';
    const interval = this.pickInterval(range);

    // Set loading state
    this.loadingMap.set(sym, true);
    this.cdr.markForCheck();

    // Get cached data if available
    const cached = this.cachedData.get(sym) || [];

    const obs = this.stocks
      .getHistory(sym, range, interval)
      .pipe(
        tap(data => {
          // Cache the new data
          this.cachedData.set(sym, data);
          // Clear loading state
          this.loadingMap.set(sym, false);
          this.cdr.markForCheck();
        }),
        // Start with cached data to prevent flicker
        startWith(cached)
      );

    this.priceSeries.set(sym, obs);
  }

  /** Simple heuristic mapping range → interval */
  private pickInterval(r: Range): string {
    switch (r) {
      case '1d':  return '5m';
      case '5d':  return '5m';
      case '1mo': return '5m';
      case '6mo': return '1d';
      case '1y':  return '1d';
      case '5y':  return '5d';
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
      map(arr => arr.slice(-100)),   // keep AI payload small
      switchMap(series =>
        this.chat.ask(q, { symbol: sym, range, series })
      ),
      map(r => r.answer),
      tap(answer => {
        // Save answer to localStorage
        this.savedAnswers.set(sym, answer);
        this.saveAnswersToLocalStorage();
      })
    );

    this.answerMap.set(sym, ans$);
    control.reset();
  }

  private saveAnswersToLocalStorage(): void {
    const answersObj: Record<string, string> = {};
    this.savedAnswers.forEach((value, key) => {
      answersObj[key] = value;
    });
    localStorage.setItem('ai-stock-answers', JSON.stringify(answersObj));
  }
}
