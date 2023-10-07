import { AppService } from './app.service';
import { Component } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  resizeObservable$: Observable<Event> = new Observable<Event>();
  resizeSubscription: Subscription = new Subscription();

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.appService.w$.next(window.innerWidth);
    this.appService.h$.next(window.innerHeight);
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription = this.resizeObservable$.subscribe((e) => {
      if (e.target instanceof Window) {
        this.appService.w$.next(e.target.innerWidth);
        this.appService.h$.next(e.target.innerHeight);
      }
    });
  }
}
