import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StockService } from '../core/services/stock.service';
import { ChatService } from '../core/services/chat.service';
import { combineLatest, map, Observable, of, startWith, switchMap } from 'rxjs';
import { PricePoint } from '../core/models/price-point';
import { FormControl } from '@angular/forms';

type Symbol = 'GOOGL' | 'NVDA' | 'SCHG';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  readonly symbols: Symbol[] = ['GOOGL', 'NVDA', 'SCHG'];
  range    = new FormControl('1mo');
  interval = new FormControl('1d');

  priceSeries = new Map<Symbol, Observable<PricePoint[]>>();

  // Chat
  question = new FormControl('');
  answer$?: Observable<string>;

  constructor(private stocks: StockService, private chat: ChatService) {}

  ngOnInit() {
    this.loadData();   // initial fetch

    // React to either dropdown instantly
    combineLatest([
      this.range.valueChanges.pipe(startWith(this.range.value)),
      this.interval.valueChanges.pipe(startWith(this.interval.value))
    ]).subscribe(() => this.loadData());
  }

  private loadData() {
    this.symbols.forEach(sym => {
      this.priceSeries.set(
        sym,
        this.stocks.getHistory(sym, this.range.value!, this.interval.value!)
      );
    });
  }

  ask(sym: Symbol) {
    if (!this.question.value?.trim()) return;

    const series$ = this.priceSeries.get(sym) ?? of([]);
    this.answer$ = series$.pipe(
      switchMap(series =>
        this.chat.ask(this.question.value!, {
          symbol: sym,
          range: this.range.value!,
          series
        })
      ),
      map(res => res.answer)
    );
  }
}
