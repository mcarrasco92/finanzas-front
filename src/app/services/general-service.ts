import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private screen = new BehaviorSubject<String>('');
  screen$ = this.screen.asObservable();

  setScreen(screen: String) {
    this.screen.next(screen);
  }
  
  private actualizaPantalla = new BehaviorSubject<boolean>(false);
  actualizaPantalla$ = this.actualizaPantalla.asObservable();

  setActualizaPantalla(actualiza: boolean) {
    this.actualizaPantalla.next(actualiza);
  }
  
}
