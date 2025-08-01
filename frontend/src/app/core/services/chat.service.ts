import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PricePoint} from '../models/price-point';

export interface AIAnswer { 
  answer: string;
  model?: string;
}

export interface StockInfo {
  symbol: string;
  name?: string;
}

@Injectable({providedIn: 'root'})
export class ChatService {
  constructor(private http: HttpClient) {}

  ask(question: string,
      context: {symbol: string; range: string; series: PricePoint[]},
      mode: 'chat' | 'summary' = 'chat',
      stockInfo?: StockInfo):
      Observable<AIAnswer> {

    return this.http.post<AIAnswer>(`${environment.api}/chat`, {
      question, 
      context, 
      mode,
      stockInfo
    });
  }
  
  getSummary(context: {symbol: string; range: string; series: PricePoint[]},
             stockInfo: StockInfo): Observable<AIAnswer> {
    return this.ask('', context, 'summary', stockInfo);
  }
}
