import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { catchError, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TarjetasService } from '../tarjetas/tarjetas';

@Injectable({
  providedIn: 'root'
})
export class MsiService {
  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient,
    private tarjetasService: TarjetasService
  ) { }

  private MsiSubscription: Subscription | null = null;

  private msiActualizado = new Subject<void>();
  msiActualizado$ = this.msiActualizado.asObservable();

  

  addMsi(msi: any): Observable<any> {
      return this.http.post(this.baseUrl + '/api/msi/registrar', msi).pipe(
        tap(() => {
          this.msiActualizado.next();
          this.MsiSubscription?.unsubscribe();
          this.MsiSubscription = this.tarjetasService.getTarjetas().subscribe();
        }),
        catchError((error) => {
          throw error;
        }));
    }

  getMsiByTarjeta(tarjetaId: string): Observable<any> {
    return this.http.get(this.baseUrl + `/api/msi/by-tarjeta/${tarjetaId}`).pipe(
      tap(() => {
      }),
      catchError((error) => {
        throw error;
      }));

  }

  getMsi(): Observable<any> {
    return this.http.get(this.baseUrl + `/api/msi`).pipe(
      tap(() => {
      }),
      catchError((error) => {
        throw error;
      }));

  }

  deleteMsi(msiId: string): Observable<any> {
    return this.http.delete(this.baseUrl + `/api/msi/eliminar/${msiId}`).pipe(
      tap(() => {
        this.msiActualizado.next();
        this.MsiSubscription?.unsubscribe();
        this.MsiSubscription = this.tarjetasService.getTarjetas().subscribe();
      }),
      catchError((error) => {
        throw error;
      }));
  }

  updateMsi(msiId: string, msi: any): Observable<any> {
    return this.http.put(this.baseUrl + `/api/msi/actualizar/${msiId}`, msi).pipe(
      tap(() => {
        this.msiActualizado.next();
        this.MsiSubscription?.unsubscribe();
        this.MsiSubscription = this.tarjetasService.getTarjetas().subscribe();
      }),
      catchError((error) => {
        throw error;
      }));
  }

  private cargaMsi = new BehaviorSubject<String>("");
  msi$ = this.cargaMsi.asObservable();

  setMsi(msiId: string) {
    this.cargaMsi.next(msiId);
  }
  
}
