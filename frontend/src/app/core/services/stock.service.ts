import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, shareReplay} from 'rxjs';
import {PricePoint} from '../models/price-point';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class StockService {
  private cache = new Map<string, Observable<PricePoint[]>>();

  constructor(private http: HttpClient) {}

  /**
   * Fetch history; memoise identical requests with shareReplay
   * so charts can subscribe multiple times without extra HTTP calls.
   */
  getHistory(symbol: string,
             range: string = '1mo',
             interval: string = '1d'): Observable<PricePoint[]> {

    const key = `${symbol}-${range}-${interval}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const params = new HttpParams()
      .set('range', range)
      .set('interval', interval);

    const request$ = this.http
      .get<PricePoint[]>(`${environment.api}/stocks/${symbol}`, {params})
      .pipe(shareReplay(1));      // cache the latest emission

    this.cache.set(key, request$);
    return request$;
  }
}
