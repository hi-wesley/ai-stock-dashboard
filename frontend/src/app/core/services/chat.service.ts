import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PricePoint} from '../models/price-point';

export interface AIAnswer { answer: string; }

@Injectable({providedIn: 'root'})
export class ChatService {
  constructor(private http: HttpClient) {}

  ask(question: string,
      context: {symbol: string; range: string; series: PricePoint[]}):
      Observable<AIAnswer> {

    return this.http.post<AIAnswer>(`${environment.api}/chat`, {question, context});
  }
}
