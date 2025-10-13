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
import { Transferencia } from '../../models/transferencia';

@Injectable({
  providedIn: 'root'
})
export class TransferenciasService {

  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient,
    private tarjetasService: TarjetasService,
    private cuentasService: CuentasService
  ) { }

  private getTransferenciasSubscription: Subscription | null = null;

  //Agregar Transaccion
    addTransferencia(transferencia: any): Observable<any> {
  
  
      return this.http.post(this.baseUrl + '/api/transferencias/registrar', transferencia).pipe(
        tap(() => {
          this.getTransferenciasSubscription?.unsubscribe();
          this.getTransferenciasSubscription = this.tarjetasService.getTarjetas().subscribe();
          this.getTransferenciasSubscription = this.cuentasService.getCuentas().subscribe();
        }),
        catchError((error) => {
          throw error;
        }));
    }


    getTransferenciaById(transferenciaId: string): Observable<any> {
      return this.http.get(this.baseUrl + `/api/transferencias/${transferenciaId}`).pipe(
        tap(() => {
        }),
        catchError((error) => {
          throw error;
        }));
  
    }

    deleteTransferencia(transferenciaId: string): Observable<any> {
      return this.http.delete(this.baseUrl + `/api/transferencias/eliminar/${transferenciaId}`).pipe(
        tap(() => {
          this.getTransferenciasSubscription?.unsubscribe();
          this.getTransferenciasSubscription = this.tarjetasService.getTarjetas().subscribe();
          this.getTransferenciasSubscription = this.cuentasService.getCuentas().subscribe();
        }),
        catchError((error) => {
          throw error;
        }));
    }

    actualizaTransferencia(transferenciaId: string, transferencia: any): Observable<any> {
      return this.http.put(this.baseUrl + `/api/transferencias/actualizar/${transferenciaId}`, transferencia).pipe(
        tap(() => {
          this.getTransferenciasSubscription?.unsubscribe();
          this.getTransferenciasSubscription = this.tarjetasService.getTarjetas().subscribe();
          this.getTransferenciasSubscription = this.cuentasService.getCuentas().subscribe();
        }),
        catchError((error) => {
          throw error;
        }));
    }

    
  private cargaTransferenciaId = new BehaviorSubject<String>('');
  transferenciaId$ = this.cargaTransferenciaId.asObservable();

  setTransferenciaId(transferenciaId: String) {
    this.cargaTransferenciaId.next(transferenciaId);  
  }

  private cargaPagoTarjeta = new BehaviorSubject<Transferencia>(new Transferencia());
  transferencia$ = this.cargaPagoTarjeta.asObservable();

  setTransferencia(transferencia: Transferencia) {
    this.cargaPagoTarjeta.next(transferencia);  
  }

  
}
