import {Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy} from '@angular/core';
import {CarsService} from '../../services/cars.service';
import {Car} from '../../interfaces/car.model';
import {TableModule} from 'primeng/table';
import {NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {WinnersModel} from '../../interfaces/winners.model';
import {WinnersService} from '../../services/winners.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-garage',
  imports: [
    TableModule,
    NgStyle,
    FormsModule,
    NgIf,
  ],
  templateUrl: './garage.component.html',
  styleUrls: ['./garage.component.css'],
})

export class GarageComponent implements AfterViewInit, OnInit, OnDestroy {
  customers: Car[] = [];
  @ViewChild('carContainer', {static: false}) carContainer!: ElementRef;
  private animationFrameId: number | null = null;
  positions: number[] = [];
  private speeds: number[] = [];
  private maxWidth = 100;
  private startTime: number = 0;
  private raceTimes: any = [];
  private hasLoggedChampion: boolean = false;
  createCarText: string = "";
  createCarColor: string = "#000000";
  updateCarText: string = "";
  updateCarColor: string = "#000000";
  carCloneId: number = 0;
  isModalOpen = false;
  winnerTime: number = 0;
  winnerName: string = "";
  finishAnimation: boolean = false;



  constructor(
    private carsService: CarsService,
    private winnersService: WinnersService,
    ) {
  }

  ngOnInit() {
    this.getAllCars();
  }

  private getAllCars() {
    this.carsService.getCars().subscribe((cars: Car[]) => {
      this.customers = cars;

      const savedPositions = localStorage.getItem('boxPositions');
      if (savedPositions) {
        this.positions = JSON.parse(savedPositions);
        this.finishAnimation = true;
      } else {
        for (let i = 0; i < this.customers.length; i++) {
          this.positions.push(0);
          this.raceTimes.push(-1);
          this.finishAnimation = false;
        }
      }

      this.speedCars();
    });
  }

  private generateUniqueRandomSpeeds(count: number, min: number, max: number): number[] {
    const uniqueSpeeds = new Set<number>();
    while (uniqueSpeeds.size < count) {
      const randomSpeed = Math.random() * (max - min) + min;
      uniqueSpeeds.add(parseFloat(randomSpeed.toFixed(4)));
    }
    return Array.from(uniqueSpeeds);
  }

  private speedCars() {
    const savedSpeeds = localStorage.getItem('carSpeeds');
    if (savedSpeeds) {
      this.speeds = JSON.parse(savedSpeeds);
    } else {
      this.speeds = this.generateUniqueRandomSpeeds(this.customers.length, 0.001, 0.1);
    }
  }

  ngAfterViewInit() {
    this.updateCarTransforms();
  }

  startAnimation() {
    this.hasLoggedChampion = false;
    this.startTime = performance.now();
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  stopAnimation() {
    this.finishAnimation = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      localStorage.setItem('boxPositions', JSON.stringify(this.positions));
      localStorage.setItem('carSpeeds', JSON.stringify(this.speeds));
    }
  }

  resetAnimation() {
    this.stopAnimation();
    for (let i = 0; i < this.customers.length; i++) {
      this.positions[i] = 0;
      this.raceTimes[i] = -1;
    }
    this.updateCarTransforms();
    localStorage.removeItem('boxPositions');
    localStorage.removeItem('carSpeeds');
    this.speedCars();
  }


  private animate() {
    this.finishAnimation = true;
    let allBoxesAtEnd = true;

    for (let i = 0; i < this.positions.length; i++) {
      if (this.positions[i] < this.maxWidth) {
        this.positions[i] += this.speeds[i];
        if (this.positions[i] > this.maxWidth) {
          this.positions[i] = this.maxWidth;

          if (this.positions.filter(position => position >= this.maxWidth).length === this.positions.length) {
            this.finishAnimation = false;
            return;
          }

          if (this.positions.filter(position => position >= this.maxWidth).length === 1) {
            if (!this.hasLoggedChampion) {
              this.openModal((performance.now() - this.startTime) / 1000, this.customers[i].name);
              this.createWinner((performance.now() - this.startTime) / 1000, this.customers[i]);
              this.hasLoggedChampion = true;
            }
          }
        }
        allBoxesAtEnd = false;
      }
    }
    this.updateCarTransforms();

    if (allBoxesAtEnd) {
      this.stopAnimation();

    } else {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  private updateCarTransforms() {
    if (this.carContainer) {
      const boxes = this.carContainer.nativeElement.children;
      for (let i = 0; i < boxes.length; i++) {
        boxes[i].style.marginLeft = `${this.positions[i]}%`;
      }
    }
  }

  startThisCar(index: number) {

    if (this.positions[index] < this.maxWidth) {
      if (this.positions[index] > this.maxWidth) {
        return;
      }
      this.positions[index] += this.speeds[index];
      this.updateCarTransforms();
      this.animationFrameId = requestAnimationFrame(() => this.startThisCar(index));
    } else {
      cancelAnimationFrame(this.animationFrameId!);
      this.animationFrameId = null;
    }
  }

  resetThisCar(index: number) {
    this.positions[index] = 0;
    this.updateCarTransforms();
    localStorage.setItem('boxPositions', JSON.stringify(this.positions));

    if (typeof this.animationFrameId === "number") {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = null;
  }


  ngOnDestroy() {
    this.stopAnimation();
  }

  createCar() {
    let carObj: Car = {
      name: this.createCarText,
      color: this.createCarColor || "#000000",
    }

    this.carsService.postCars(carObj).subscribe(
      (cars: Car[]) => {
        this.getAllCars();
        this.createCarText = "";
        this.createCarColor = "#000000";
      },
      error => {
        console.log(error);
      }
    )
  }

  selectCar(car: Car) {
    if (car.id) {
      this.carCloneId = car.id;
      this.updateCarText = car.name;
      this.updateCarColor = car.color || "#000000";
    }
  }

  updateCar() {
    if (this.carCloneId === 0) {
      alert("select car");
      return;
    }

    let carObj: Car = {
      name: this.updateCarText,
      color: this.updateCarColor,
    }

    this.carsService.putCars(carObj, this.carCloneId).subscribe(
      (cars: Car[]) => {
        this.getAllCars();
        this.updateCarText = "";
        this.updateCarColor = "#000000";
        this.carCloneId = 0;
      },
      error => {
        console.log(error);
      }
    )
  }

  removeCars(id: number) {
    this.carsService.deleteCars(id).subscribe(
      (cars: Car[]) => {
        this.getAllCars();
        this.updateCarText = "";
        this.updateCarColor = "#000000";
        this.carCloneId = 0;

        this.winnersService.deleteWinners(id).subscribe(
          (winner) => {
          }
        )
      },
      error => {
        console.log(error);
      }
    )
  }

  openModal(time: number, name: string) {
    this.winnerTime = time;
    this.winnerName = name;

    this.isModalOpen = true;
    setTimeout(() => {
      this.isModalOpen = false;
    }, 3000);
  }

  createWinner(time: number, car: Car) {
    if (car.id){
      this.winnersService.getByIdWinners(car.id).subscribe(
        (winner: any) => {
          let objWinner: WinnersModel = {
            wins: winner.wins + 1,
            time: time,
          }

          if (car.id){
            this.winnersService.putWinners(objWinner, car.id).subscribe(
              (winner) => {
              }
            )
          }
        },
        () => {
          let objWinner: WinnersModel = {
            id: car.id,
            wins: 1,
            time: time,
          }
          this.winnersService.postWinners(objWinner).subscribe(
            (winner) => {
            }
          )
        }
      )
    }
  }

  generateCars() {
    const carNames = [
      "Ford", "BMW", "Audi", "Tesla", "Mercedes", "Toyota", "Honda", "Nissan", "Chevrolet", "Lexus",
      "Mazda", "Subaru", "Volkswagen", "Volvo", "Porsche", "Jaguar", "Ferrari", "Lamborghini", "Maserati", "Bugatti"
    ];

    const requests = [];

    for (let i = 0; i < 100; i++) {
      const randomName = carNames[Math.floor(Math.random() * carNames.length)] + " " + (Math.floor(Math.random() * 1000));
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

      const carObj: Car = {
        name: randomName,
        color: randomColor
      };

      requests.push(this.carsService.postCars(carObj));
    }

    forkJoin(requests).subscribe(() => {
      this.getAllCars();
    });
  }

}
