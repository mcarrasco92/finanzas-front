import { Component } from '@angular/core';
import { CuentasService } from '../../services/cuentas/cuentas';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { CommonModule } from '@angular/common';
import { Toast } from '../../shared/toast/toast';
import { ToastService, TypeToast, typToast } from '../../shared/toast/service/toast-service';
import { Loading } from '../../shared/loading/loading';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink, Router ,RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cuentas',
  imports: [CommonModule, Toast, Loading, FormsModule, RouterOutlet, RouterLink, RouterModule],
  templateUrl: './cuentas.html',
  styleUrl: './cuentas.css'
})
export class Cuentas {

  constructor(private cuentasService: CuentasService, 
    private tarjetaService: TarjetasService,
    private toast: ToastService, 
    private cdr: ChangeDetectorRef,
private router: Router) { }

  isLoading: boolean = false;
  btnNuevaCuenta: boolean = true;
  btnNuevaTDC: boolean = true;

  private dataSubscription!: Subscription;

  ngOnInit(): void {

    this.dataSubscription = this.cuentasService.data$.subscribe(data => {
      if(!data && this.router.url === '/dashboard/cuentas/debitof'){
        this.btnNuevaCuenta = false;
      }else{
        this.btnNuevaCuenta = true;
      }
    })

    this.dataSubscription = this.tarjetaService.data$.subscribe(data => {
      if(!data && this.router.url === '/dashboard/cuentas/tdcf'){
        this.btnNuevaTDC = false;
      }else{
        this.btnNuevaTDC = true;
      }
    })
    
    this.cdr.detectChanges();
  }


  nuevaCuenta() {
    this.cuentasService.setData(null);
    this.btnNuevaCuenta = false;
    this.router.navigate(['/dashboard/cuentas/debitof']);
  }

  nuevaTDC() {
    this.tarjetaService.setData(null);
    this.btnNuevaTDC = false;
    this.router.navigate(['/dashboard/cuentas/tdcf']);
  }

  isDebito(): boolean {
    return (this.router.url === '/dashboard/cuentas/debito' || this.router.url === '/dashboard/cuentas/debitof');
  }

  isTDC(): boolean {
    return (this.router.url === '/dashboard/cuentas/tdc' || this.router.url === '/dashboard/cuentas/tdcf');
  }




}
