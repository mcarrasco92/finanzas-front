import { Component } from '@angular/core';
import { CuentasService } from '../../services/cuentas/cuentas';
import { TdcService } from '../../services/tdc/tdc-service';
import { CommonModule } from '@angular/common';
import { Toast } from '../../shared/toast/toast';
import { ToastService, TypeToast, typToast } from '../../shared/toast/service/toast-service';
import { Loading } from '../../shared/loading/loading';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink, Router ,RouterModule } from '@angular/router';

@Component({
  selector: 'app-cuentas',
  imports: [CommonModule, Toast, Loading, FormsModule, RouterOutlet, RouterLink, RouterModule],
  templateUrl: './cuentas.html',
  styleUrl: './cuentas.css'
})
export class Cuentas {

  constructor(private cuentasService: CuentasService, 
    private tdcService: TdcService,
    private toast: ToastService, 
    private cdr: ChangeDetectorRef,
private router: Router) { }

  isLoading: boolean = false;
  agregaCuenta: boolean = true;
  modulo: string = 'Cuentas';

  ngOnInit(): void {
    this.agregaCuenta = true;
    
    this.cdr.detectChanges();
  }


  toggleAgregaCuenta(): void {
    this.agregaCuenta = !this.agregaCuenta;
  }


  nuevaCuenta() {
    this.cuentasService.setData(null);
    this.router.navigate(['/dashboard/cuentas/debitof']);
  }

  nuevaTDC() {
    this.tdcService.setData(null);
    this.router.navigate(['/dashboard/cuentas/tdcf']);
  }

  isDebito(): boolean {
    return this.router.url === '/dashboard/cuentas/debito' || this.router.url === '/dashboard/cuentas/debitof';
  }

  isTDC(): boolean {
    return this.router.url === '/dashboard/cuentas/tdc' || this.router.url === '/dashboard/cuentas/tdcf';
  }




}
