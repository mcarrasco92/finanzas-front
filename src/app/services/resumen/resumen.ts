import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

  private cache = new Map<string, any>();

  getResumenMensual(mes: number, anio: number): Observable<any> {
    const key = `${mes}-${anio}`;
    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }
    return this.http.get(this.baseUrl + `/api/resumen/mensual`, {
      params: { mes: mes.toString(), anio: anio.toString() }
    }).pipe(
      tap((response: any) => {
        if (response.coderr === '0000') {
          this.cache.set(key, response);
          this.resumenData.next(response.data);
        }
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  // Obtiene los 12 meses del año en una sola llamada y los almacena en caché individualmente
  getResumenAnual(anio: number): Observable<any[]> {
    return this.http.get(this.baseUrl + `/api/resumen/anual`, {
      params: { anio: anio.toString() }
    }).pipe(
      tap((response: any) => {
        if (response.coderr === '0000') {
          for (const mensual of response.data as ResumenMensual[]) {
            this.cache.set(`${mensual.mes}-${mensual.anio}`, { coderr: '0000', data: mensual });
          }
        }
      }),
      map((response: any) => {
        if (response.coderr !== '0000') {
          return Array.from({ length: 12 }, () => ({ coderr: response.coderr, data: null }));
        }
        const byMes = new Map<number, ResumenMensual>();
        for (const m of response.data as ResumenMensual[]) byMes.set(m.mes, m);
        return Array.from({ length: 12 }, (_, i) => {
          const m = byMes.get(i + 1);
          return m ? { coderr: '0000', data: m } : { coderr: '0000', data: null };
        });
      }),
      catchError((error) => { throw error; })
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

  setResumen(resumen: ResumenMensual | null): void {
    this.resumenData.next(resumen);
  }
}
