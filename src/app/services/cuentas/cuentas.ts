import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { BehaviorSubject } from 'rxjs';
import { Cuenta } from '../../models/cuenta';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {

  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient) { }

  private getCuentasSubscription: Subscription | null = null;

  ordenaCuentas(datos: any): Observable<any> {
    return this.http.post(this.baseUrl + '/api/cuentas/orden', datos).pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));
  }

  //Consultar cuentas
  getCuentas(): Observable<any> {

    return this.http.get(this.baseUrl + '/api/cuentas').pipe(
      tap((response: any) => {
  
        if (response.coderr === '0000') {
          const cuentasList:Cuenta[] = response.data.cuentas;
          cuentasList.sort((a, b) => a.orden - b.orden);
          this.setCuentasList(cuentasList);
          this.setSaldoDisponible(response.data.saldoDisponible);
          this.setSaldoInvertido(response.data.saldoInvertido);
          this.setSaldoTotal(response.data.saldoTotal);
        }
      }),
      catchError((error) => {
        // Manejo del error
        console.error('Error en getCuentas:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      })
    );
    
  }

  //Agregar cuenta
  addCuenta(cuenta: any): Observable<any> {

    return this.http.post(this.baseUrl + '/api/cuentas/registrar', cuenta).pipe(
      tap(() => {
        this.getCuentasSubscription?.unsubscribe();
        this.getCuentasSubscription = this.getCuentas().subscribe();
      }),
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));

    // Lógica para agregar una nueva cuenta
  }

  //Actualizar cuenta
  updateCuenta(cuentaId: string, cuenta: any): Observable<any> {

    return this.http.put(this.baseUrl + `/api/cuentas/actualizar/${cuentaId}`, cuenta).pipe(
      tap(() => {
        this.getCuentasSubscription?.unsubscribe();
        this.getCuentasSubscription = this.getCuentas().subscribe();
      }),
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      })); 
    // Lógica para actualizar una cuenta existente
  }

 

  getCuentaById(cuentaId: string): Observable<any> {
    return this.http.get(this.baseUrl + `/api/cuentas/${cuentaId}`).pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  

  }


  activaDesactivaCuenta(cuentaId: string, activa: boolean): Observable<any> {
    return this.http.put(this.baseUrl + `/api/cuentas/activar/${cuentaId}`, activa).pipe(
      tap(() => {
        this.getCuentasSubscription?.unsubscribe();
        this.getCuentasSubscription = this.getCuentas().subscribe();
      }),
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  
  }


   //Eliminar cuenta
   deleteCuenta(cuentaId: string) : Observable<any>{
    return this.http.delete(this.baseUrl + `/api/cuentas/eliminar/${cuentaId}`).pipe(
      tap(() => {
        this.getCuentasSubscription?.unsubscribe();
        this.getCuentasSubscription = this.getCuentas().subscribe();
      }),
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      })); 
  }


  private cuentasList = new BehaviorSubject<Cuenta[]>([]);
  private saldoDisponible = new BehaviorSubject<number>(0);
  private saldoInvertido = new BehaviorSubject<number>(0);
  private saldoTotal = new BehaviorSubject<number>(0);

  cuentasList$ = this.cuentasList.asObservable();
  saldoDisponible$ = this.saldoDisponible.asObservable();
  saldoInvertido$ = this.saldoInvertido.asObservable();
  saldoTotal$ = this.saldoTotal.asObservable();

  setCuentasList(cuentas: Cuenta[]) {
    this.cuentasList.next(cuentas);
  }

  setSaldoDisponible(saldo: number) {
    this.saldoDisponible.next(saldo);
  }

  setSaldoInvertido(saldo: number) {
    this.saldoInvertido.next(saldo);
  }

  setSaldoTotal(saldo: number) {
    this.saldoTotal.next(saldo);
  }


}
