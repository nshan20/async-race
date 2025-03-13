import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Car} from '../interfaces/car.model';

@Injectable({
  providedIn: 'root'
})

export class CarsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {
  }

  getCars() {
    return this.http.get<Car[]>(`${this.apiUrl}/garage`);
  }

  postCars(obj: Car) {
    return this.http.post<Car[]>(`${this.apiUrl}/garage`, obj);
  }

  putCars(obj: Car, id: number) {
    return this.http.put<Car[]>(`${this.apiUrl}/garage/${id}`, obj);
  }

  deleteCars( id: number) {
    return this.http.delete<Car[]>(`${this.apiUrl}/garage/${id}`);
  }
}
