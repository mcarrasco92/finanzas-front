import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private idCuenta = new BehaviorSubject<any>(null);
  data$ = this.idCuenta.asObservable();

  setData(data: any) {
    this.idCuenta.next(data);
  }
  
}
