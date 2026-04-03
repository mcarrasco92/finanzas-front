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
import { ResumenService } from '../resumen/resumen';



@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {
  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient,
    private tarjetasService: TarjetasService,
    private cuentasService: CuentasService,
    private resumenService: ResumenService
  ) { }

  private getTransaccionesSubscription: Subscription | null = null;

  //Consultar Transacciones
  getTransaccionesByMonth(data: any): Observable<any> {
    return this.http.post(this.baseUrl + '/api/transacciones/getTransacciones',data).pipe(
      tap(() => {
      }),
      catchError((error) => {
        throw error;
      }));

  }

  getTransaccionesParaBusqueda(): Observable<any> {
    return this.http.get(this.baseUrl + '/api/transacciones/busqueda').pipe(
      catchError((error) => { throw error; })
    );
  }

  //Agregar Transaccion
  addTransaccion(transaccion: any): Observable<any> {


    return this.http.post(this.baseUrl + '/api/transacciones/registrar', transaccion).pipe(
      tap(() => {
        this.resumenService.clearCache();
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
    return this.http.put(this.baseUrl + `/api/transacciones/actualizar/${transaccionId}`, transaccion).pipe(
      tap(() => {
        this.resumenService.clearCache();
        this.getTransaccionesSubscription?.unsubscribe();
        this.getTransaccionesSubscription = this.tarjetasService.getTarjetas().subscribe();
        this.getTransaccionesSubscription = this.cuentasService.getCuentas().subscribe();
      }),
      catchError((error) => {
        throw error;
      }));
  }

  getTransaccionById(transaccionId: string): Observable<any> {
    return this.http.get(this.baseUrl + `/api/transacciones/${transaccionId}`).pipe(
      tap(() => {
      }),
      catchError((error) => {
        throw error;
      }));

  }

  //Eliminar transaccion
  deleteTransaccion(transaccionId: string): Observable<any> {
    return this.http.delete(this.baseUrl + `/api/transacciones/eliminar/${transaccionId}`).pipe(
      tap(() => {
        this.resumenService.clearCache();
        this.getTransaccionesSubscription?.unsubscribe();
        this.getTransaccionesSubscription = this.tarjetasService.getTarjetas().subscribe();
        this.getTransaccionesSubscription = this.cuentasService.getCuentas().subscribe();
      }),
      catchError((error) => {
        throw error;
      }));
  }

  

  private transaccionesListData = new BehaviorSubject<Transaccion[]>([]);
  transaccionesList$ = this.transaccionesListData.asObservable();

  setTransaccionesList(transacciones: Transaccion[]): void {
    this.transaccionesListData.next(transacciones);
  }

  getConceptosSugeridos(): string[] {
    const transacciones = this.transaccionesListData.getValue();
    const conceptos = transacciones
      .map(t => t.concepto)
      .filter((c): c is string => !!c && c.trim().length > 0);
    return [...new Set(conceptos)].sort((a, b) => a.localeCompare(b));
  }

  private cargaTransaccion = new BehaviorSubject<Transaccion>(new Transaccion());
  transaccion$ = this.cargaTransaccion.asObservable();

  setTransaccion(transaccion: Transaccion) {
    this.cargaTransaccion.next(transaccion);
  }

  private cargaPago = new BehaviorSubject<Transaccion>(new Transaccion());
  pago$ = this.cargaPago.asObservable();

  setPago(pago: Transaccion) {
    this.cargaPago.next(pago);
  }




}
