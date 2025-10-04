import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { catchError, Observable } from 'rxjs';
import { Tarjeta } from '../../models/tarjeta';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { GeneralService } from '../general-service';

@Injectable({
  providedIn: 'root'
})
export class TarjetasService {

  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient,
    private generalService: GeneralService
  ) { }

  private getTarjetasSubscription: Subscription | null = null;

  ordenaTarjetas(datos: any): Observable<any> {
    return this.http.post(this.baseUrl + '/api/tarjetas/orden', datos).pipe(
      catchError((error) => {
        throw error;
      }));
  }

  //Consultar Tarjetas
  getTarjetas(): Observable<any> {

    return this.http.get(this.baseUrl + '/api/tarjetas').pipe(
    tap((response: any) => {
      if (response.coderr === '0000') {
        const tarejtasList:Tarjeta[] = response.data.tarjetas;
        tarejtasList.sort((a, b) => a.orden - b.orden);
        this.setTarjetasList(tarejtasList);
      }
    }),
    catchError((error) => {
      throw error;
    }));
  
}

//Agregar Tarjeta
addTarjeta(tarjeta: any): Observable<any> {
  this.generalService.setIsLoading(true);
  return this.http.post(this.baseUrl + '/api/tarjetas/registrar', tarjeta).pipe(
    tap(() => {
      this.generalService.setIsLoading(false);
      this.getTarjetasSubscription?.unsubscribe();
      this.getTarjetasSubscription = this.getTarjetas().subscribe();
    }),
    catchError((error) => {
      throw error;
    }));  
}

//Actualizar tarjeta
updateTarjeta(tarjetaId: string, tarjeta: any): Observable<any> {
  this.generalService.setIsLoading(true);
  return this.http.put(this.baseUrl + `/api/tarjetas/actualizar/${tarjetaId}`, tarjeta).pipe(
    tap(() => {
      this.generalService.setIsLoading(false);
      this.getTarjetasSubscription?.unsubscribe();
      this.getTarjetasSubscription = this.getTarjetas().subscribe();
    }),
    catchError((error) => {
      throw error;
    }));  
}

getTarjetaById(tarjetaId: string): Observable<any> {
  this.generalService.setIsLoading(true);
  return this.http.get(this.baseUrl + `/api/tarjetas/${tarjetaId}`).pipe(
    tap(() => {
      this.generalService.setIsLoading(false);
    }),
    catchError((error) => {
      throw error;
    }));  

}

activaDesactivaTarjeta(tarjetaId: string, activa: boolean): Observable<any> {
  this.generalService.setIsLoading(true);
  return this.http.put(this.baseUrl + `/api/tarjetas/activar/${tarjetaId}`, activa).pipe(
    tap(() => {
      this.generalService.setIsLoading(false);
      this.getTarjetasSubscription?.unsubscribe();
      this.getTarjetasSubscription = this.getTarjetas().subscribe();
    }),
    catchError((error) => {
      throw error;
    }));  
}

//Eliminar tarjeta
deleteTarjeta(tarjetaId: string): Observable<any>{ 
  this.generalService.setIsLoading(true);
  return this.http.delete(this.baseUrl + `/api/tarjetas/eliminar/${tarjetaId}`).pipe(
    tap(() => {
      this.generalService.setIsLoading(false);
      this.getTarjetasSubscription?.unsubscribe();
      this.getTarjetasSubscription = this.getTarjetas().subscribe();
    }),
    catchError((error) => {
      // Manejo del error
      throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
    })); 
}

private tarjetasList = new BehaviorSubject<Tarjeta[]>([]);
tarjetasList$ = this.tarjetasList.asObservable();

setTarjetasList(tarjetas: Tarjeta[]) {
  this.tarjetasList.next(tarjetas);
}




}
