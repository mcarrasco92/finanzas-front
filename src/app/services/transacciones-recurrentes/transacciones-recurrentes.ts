import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { catchError, tap } from 'rxjs/operators';
import { TransaccionRecurrenteModel } from '../../models/transaccion-recurrente';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesRecurrentesService {
  baseUrl = environment.apiUrl;

  private transaccionRecurrente = new BehaviorSubject<TransaccionRecurrenteModel>(new TransaccionRecurrenteModel());
  transaccionRecurrente$ = this.transaccionRecurrente.asObservable();

  constructor(private http: HttpClient) {}

  getTransaccionesRecurrentes(): Observable<any> {
    return this.http.get(this.baseUrl + `/api/transaccion-recurrente`).pipe(
      catchError((error) => { throw error; })
    );
  }

  getTransaccionRecurrenteById(id: string): Observable<any> {
    return this.http.get(this.baseUrl + `/api/transaccion-recurrente/${id}`).pipe(
      catchError((error) => { throw error; })
    );
  }

  addTransaccionRecurrente(data: any): Observable<any> {
    return this.http.post(this.baseUrl + `/api/transaccion-recurrente/registrar`, data).pipe(
      catchError((error) => { throw error; })
    );
  }

  updateTransaccionRecurrente(id: string, data: any): Observable<any> {
    return this.http.put(this.baseUrl + `/api/transaccion-recurrente/actualizar/${id}`, data).pipe(
      catchError((error) => { throw error; })
    );
  }

  deleteTransaccionRecurrente(id: string): Observable<any> {
    return this.http.delete(this.baseUrl + `/api/transaccion-recurrente/eliminar/${id}`).pipe(
      catchError((error) => { throw error; })
    );
  }

  setTransaccionRecurrente(trans: TransaccionRecurrenteModel) {
    this.transaccionRecurrente.next(trans);
  }
}
