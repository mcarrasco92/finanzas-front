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

  private mostrarDesactivadas = new BehaviorSubject<boolean>(false);
  mostrarDesactivadas$ = this.mostrarDesactivadas.asObservable();

  setMostrarDesactivadas(value: boolean) {
    this.mostrarDesactivadas.next(value);
  }

  private mostrarCategoriasDesactivadas = new BehaviorSubject<boolean>(false);
  mostrarCategoriasDesactivadas$ = this.mostrarCategoriasDesactivadas.asObservable();

  setMostrarCategoriasDesactivadas(value: boolean) {
    this.mostrarCategoriasDesactivadas.next(value);
  }

  constructor() { }
  
}
