import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { ListaCuentasResponse } from '../../components/interfaces/cuentas';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {

  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient) { }

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
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));
    
  }

  //Agregar cuenta
  addCuenta(cuenta: any): Observable<any> {

    return this.http.post(this.baseUrl + '/api/cuentas/registrar', cuenta).pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  

    // Lógica para agregar una nueva cuenta
  }

  //Actualizar cuenta
  updateCuenta(cuentaId: string, cuenta: any): Observable<any> {
    return this.http.put(this.baseUrl + `/api/cuentas/actualizar/${cuentaId}`, cuenta).pipe(
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
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  
  }


   //Eliminar cuenta
   deleteCuenta(cuentaId: string) {
    // Lógica para eliminar una cuenta
  }



}
