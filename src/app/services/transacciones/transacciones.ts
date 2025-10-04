import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { catchError, Observable } from 'rxjs';
import { Transaccion } from '../../models/transaccion';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TarjetasService } from '../tarjetas/tarjetas';
import { CuentasService } from '../cuentas/cuentas';
import { GeneralService } from '../general-service';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {
  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient,
    private tarjetasService: TarjetasService,
    private cuentasService: CuentasService,
    private generalService: GeneralService
  ) { }

  private getTransaccionesSubscription: Subscription | null = null;

  //Consultar Transacciones
  getTransaccionesByMonth(data: any): Observable<any> {
    this.generalService.setIsLoading(true);
    return this.http.post(this.baseUrl + '/api/transacciones/getTransacciones',data).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
      }),
      catchError((error) => {
        throw error;
      }));

  }

  //Agregar Transaccion
  addTransaccion(transaccion: any): Observable<any> {

    this.generalService.setIsLoading(true);

    return this.http.post(this.baseUrl + '/api/transacciones/registrar', transaccion).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
        this.getTransaccionesSubscription?.unsubscribe();
        this.getTransaccionesSubscription = this.tarjetasService.getTarjetas().subscribe();
        this.getTransaccionesSubscription = this.cuentasService.getCuentas().subscribe();
      }),
      catchError((error) => {
        throw error;
      }));
  }

  //Actualizar transaccion
  updateTransaccion(transaccionId: string, transaccion: any): Observable<any> {
    this.generalService.setIsLoading(true);
    return this.http.put(this.baseUrl + `/api/transacciones/actualizar/${transaccionId}`, transaccion).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
        this.getTransaccionesSubscription?.unsubscribe();
        this.getTransaccionesSubscription = this.tarjetasService.getTarjetas().subscribe();
        this.getTransaccionesSubscription = this.cuentasService.getCuentas().subscribe();
      }),
      catchError((error) => {
        throw error;
      }));
  }

  getTransaccionById(transaccionId: string): Observable<any> {
    this.generalService.setIsLoading(true);
    return this.http.get(this.baseUrl + `/api/transacciones/${transaccionId}`).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
      }),
      catchError((error) => {
        throw error;
      }));

  }

  //Eliminar transaccion
  deleteTransaccion(transaccionId: string): Observable<any> {
    this.generalService.setIsLoading(true);
    return this.http.delete(this.baseUrl + `/api/transacciones/eliminar/${transaccionId}`).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
        this.getTransaccionesSubscription?.unsubscribe();
        this.getTransaccionesSubscription = this.tarjetasService.getTarjetas().subscribe();
        this.getTransaccionesSubscription = this.cuentasService.getCuentas().subscribe();
      }),
      catchError((error) => {
        throw error;
      }));
  }

  

  private cargaTransaccion = new BehaviorSubject<Transaccion>(new Transaccion());
  transaccion$ = this.cargaTransaccion.asObservable();

  setTransaccion(transaccion: Transaccion) {
    this.cargaTransaccion.next(transaccion);
  }




}
