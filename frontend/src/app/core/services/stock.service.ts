import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PricePoint} from '../models/price-point';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class StockService {
  constructor(private http: HttpClient) {}

  getHistory(symbol: string,
             range: string = '1mo',
             interval: string = '1d'): Observable<PricePoint[]> {

    const params = new HttpParams()
      .set('range', range)
      .set('interval', interval);

    return this.http
      .get<PricePoint[]>(`${environment.api}/stocks/${symbol}`, {params});
  }
}
