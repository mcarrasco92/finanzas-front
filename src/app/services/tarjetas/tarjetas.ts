import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TarjetasService {

  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient) { }

  private idTarjeta = new BehaviorSubject<any>(null);
  data$ = this.idTarjeta.asObservable();

  setData(data: any) {
    this.idTarjeta.next(data);
  }

  ordenaTarjetas(datos: any): Observable<any> {
    return this.http.post(this.baseUrl + '/api/tarjetas/orden', datos).pipe(
      catchError((error) => {
        throw error;
      }));
  }

  //Consultar Tarjetas
  getTarjetas(): Observable<any> {

    return this.http.get(this.baseUrl + '/api/tarjetas').pipe(
    catchError((error) => {
      throw error;
    }));
  
}

//Agregar Tarjeta
addTarjeta(tarjeta: any): Observable<any> {

  return this.http.post(this.baseUrl + '/api/tarjetas/registrar', tarjeta).pipe(
    catchError((error) => {
      throw error;
    }));  
}

//Actualizar tarjeta
updateTarjeta(tarjetaId: string, tarjeta: any): Observable<any> {
  return this.http.put(this.baseUrl + `/api/tarjetas/actualizar/${tarjetaId}`, tarjeta).pipe(
    catchError((error) => {
      throw error;
    }));  
}

getTarjetaById(tarjetaId: string): Observable<any> {
  return this.http.get(this.baseUrl + `/api/tarjetas/${tarjetaId}`).pipe(
    catchError((error) => {
      throw error;
    }));  

}

activaDesactivaTarjeta(tarjetaId: string, activa: boolean): Observable<any> {
  return this.http.put(this.baseUrl + `/api/tarjetas/activar/${tarjetaId}`, activa).pipe(
    catchError((error) => {
      throw error;
    }));  
}

//Eliminar tarjeta
deleteTarjeta(tarjetaId: string) {
  // Lógica para eliminar una tarjeta
}

}
