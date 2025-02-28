import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Car} from '../interfaces/car.model';

@Injectable({
  providedIn: 'root'
})

export class CarsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getCars() {
    return this.http.get<Car[]>(`${this.apiUrl}/garage`);
  }

}
