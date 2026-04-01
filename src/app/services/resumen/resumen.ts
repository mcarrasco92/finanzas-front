import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { ResumenMensual } from '../../models/resumen-mensual';

@Injectable({
  providedIn: 'root'
})
export class ResumenService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private resumenData = new BehaviorSubject<ResumenMensual | null>(null);
  resumen$ = this.resumenData.asObservable();

  getResumenMensual(mes: number, anio: number): Observable<any> {
    return this.http.get(this.baseUrl + `/api/resumen/mensual`, {
      params: { mes: mes.toString(), anio: anio.toString() }
    }).pipe(
      tap((response: any) => {
        if (response.coderr === '0000') {
          this.resumenData.next(response.data);
        }
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  setResumen(resumen: ResumenMensual | null): void {
    this.resumenData.next(resumen);
  }
}
