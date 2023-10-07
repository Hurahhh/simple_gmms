import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  w$ = new BehaviorSubject(0);
  h$ = new BehaviorSubject(0);
}
