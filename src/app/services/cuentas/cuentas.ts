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

  //Consultar cuentas
  getCuentas(): Observable<any> {

      
   
      return this.http.get(this.baseUrl + '/api/cuentas').pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));
    
  }

  //Agregar cuenta
  addCuenta(cuenta: any) {
    // Lógica para agregar una nueva cuenta
  }

  //Actualizar cuenta
  updateCuenta(cuentaId: number, cuenta: any) {
    // Lógica para actualizar una cuenta existente
  }

  //Eliminar cuenta
  deleteCuenta(cuentaId: number) {
    // Lógica para eliminar una cuenta
  }

  getCuentaById(cuentaId: number) {

  }



}
