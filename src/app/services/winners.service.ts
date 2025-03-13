import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Car} from '../interfaces/car.model';
import {WinnersModel} from '../interfaces/winners.model';

@Injectable({
  providedIn: 'root'
})

export class WinnersService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {
  }

  getWinners() {
    return this.http.get<WinnersModel[]>(`${this.apiUrl}/winners`);
  }

  getByIdWinners(id: number) {
    return this.http.get<WinnersModel[]>(`${this.apiUrl}/winners/${id}`);
  }

  postWinners(obj: WinnersModel) {
    return this.http.post<WinnersModel[]>(`${this.apiUrl}/winners`, obj);
  }

  putWinners(obj: WinnersModel, id: number) {
    return this.http.put<WinnersModel[]>(`${this.apiUrl}/winners/${id}`, obj);
  }

  deleteWinners( id: number) {
    return this.http.delete<WinnersModel[]>(`${this.apiUrl}/winners/${id}`);
  }
}
