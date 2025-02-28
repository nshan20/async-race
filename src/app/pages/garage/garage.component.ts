import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CarsService } from '../../services/cars.service';
import { Car } from '../../interfaces/car.model';
import { TableModule } from 'primeng/table';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-garage',
  imports: [
    TableModule,
    NgStyle,
  ],
  templateUrl: './garage.component.html',
  styleUrls: ['./garage.component.css'],
})

export class GarageComponent implements AfterViewInit, OnInit, OnDestroy {
  customers: Car[] = [];
  @ViewChild('boxContainer') boxContainer!: ElementRef;
  private animationFrameId: number | null = null;
  positions: number[] = [];
  private speeds: number[] = [];
  private maxWidth = 0;
  private startTime: number = 0;
  private raceTimes: number[] = [];

  constructor(private carsService: CarsService) {}

  private generateUniqueRandomSpeeds(count: number, min: number, max: number): number[] {
    const uniqueSpeeds = new Set<number>();
    while (uniqueSpeeds.size < count) {
      const randomSpeed = Math.random() * (max - min) + min;
      uniqueSpeeds.add(parseFloat(randomSpeed.toFixed(4)));
    }
    return Array.from(uniqueSpeeds);
  }

  ngOnInit() {
    this.carsService.getCars().subscribe((cars: Car[]) => {
      this.customers = cars;
      for (let i = 0; i < this.customers.length; i++) {
        this.positions.push(0);
        this.raceTimes.push(-1);
      }

      // Загрузка скоростей из localStorage
      const savedSpeeds = localStorage.getItem('carSpeeds');
      if (savedSpeeds) {
        this.speeds = JSON.parse(savedSpeeds);
      } else {
        this.speeds = this.generateUniqueRandomSpeeds(this.customers.length, 0.01, 0.1);
      }
    });

    const savedPositions = localStorage.getItem('boxPositions');
    if (savedPositions) {
      this.positions = JSON.parse(savedPositions);
    }
  }

  ngAfterViewInit() {
    this.maxWidth = window.innerWidth - 50;
    this.updateBoxTransforms();
  }

  startAnimation() {
    this.startTime = performance.now();
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  stopAnimation() {
    alert("")
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      localStorage.setItem('boxPositions', JSON.stringify(this.positions));
      localStorage.setItem('carSpeeds', JSON.stringify(this.speeds)); // Сохраняем speeds в localStorage
    }
  }

  resetAnimation() {
    this.stopAnimation();
    for (let i = 0; i < this.customers.length; i++) {
      this.positions[i] = 0;
      this.raceTimes[i] = -1;
    }
    this.updateBoxTransforms();
    localStorage.removeItem('boxPositions');
    localStorage.removeItem('carSpeeds'); // Удаляем сохраненные скорости
  }

  private animate() {
    let allBoxesAtEnd = true;

    for (let i = 0; i < this.positions.length; i++) {
      if (this.positions[i] < this.maxWidth) {
        this.positions[i] += this.speeds[i];
        if (this.positions[i] > 100) {
          // console.log((performance.now() - this.startTime) / 1000);
          this.positions[i] = 100;
        }
        allBoxesAtEnd = false;
      } else if (this.raceTimes[i] === -1) {
        this.raceTimes[i] = (performance.now() - this.startTime) / 1000;
      }
    }

    this.updateBoxTransforms();

    if (allBoxesAtEnd) {
      this.stopAnimation();

    } else {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
    console.log("000");
  }

  private updateBoxTransforms() {
    const boxes = this.boxContainer.nativeElement.children;
    for (let i = 0; i < boxes.length; i++) {
      boxes[i].style.marginLeft = `${this.positions[i]}%`;
    }
  }

  ngOnDestroy() {
    this.stopAnimation();
  }
}
