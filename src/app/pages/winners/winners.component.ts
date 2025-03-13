import {Component, OnInit,} from '@angular/core';
import {TableModule} from 'primeng/table';
import {CarsService} from '../../services/cars.service';
import {WinnersService} from '../../services/winners.service';
import {WinnersModel} from '../../interfaces/winners.model';
import {Car} from '../../interfaces/car.model';


@Component({
  selector: 'app-winners',
  templateUrl: './winners.component.html',
  imports: [
    TableModule
  ],
  styleUrls: ['./winners.component.css']
})
export class WinnersComponent implements OnInit {

  winners: WinnersModel[] = [];
  cars: Car[] = [];
  customers: any = [];

  constructor(
    private carsService: CarsService,
    private winnersService: WinnersService,
  ) {
  }


  ngOnInit() {
    this.winnersService.getWinners().subscribe(
      (winners) => {
        this.winners = winners;

        this.carsService.getCars().subscribe(
          (cars) => {
            this.cars = cars;

            const carsMap = new Map(cars.map(car => [car.id, car]));

            this.customers = this.winners
              .map(winner => {
                const car = carsMap.get(winner.id);
                return car ? {...winner, ...car} : null;
              })
              .filter(customer => customer !== null);
          }, error => {
            console.log(error);
          }
        );
      }, error => {
        console.log(error);
      }
    );
  }


}
