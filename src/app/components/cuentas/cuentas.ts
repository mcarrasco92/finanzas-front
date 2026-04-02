import { Component, ChangeDetectorRef } from '@angular/core';
import { CuentasService } from '../../services/cuentas/cuentas';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { CommonModule } from '@angular/common';
import { Toast } from '../../shared/toast/toast';
import { ToastService } from '../../shared/toast/service/toast-service';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeneralService } from '../../services/general-service';

@Component({
  selector: 'app-cuentas',
  imports: [CommonModule, Toast, FormsModule, RouterOutlet, RouterModule],
  templateUrl: './cuentas.html',
  styleUrl: './cuentas.css'
})
export class Cuentas {

  constructor(
    private cuentasService: CuentasService,
    private tarjetaService: TarjetasService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private generalService: GeneralService
  ) { }

  btnNuevaCuenta: boolean = true;
  btnNuevaTDC: boolean = true;

  private screenSubscription!: Subscription;

  ngOnInit(): void {
    this.screenSubscription = this.generalService.screen$.subscribe(screen => {
      this.btnNuevaTDC = false;
      this.btnNuevaCuenta = false;
      if (screen === 'lista-debito' || screen === 'form-debito-id') {
        this.btnNuevaCuenta = true;
      } else if (screen === 'lista-tdc' || screen === 'form-tdc-id') {
        this.btnNuevaTDC = true;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.screenSubscription?.unsubscribe();
  }

  navegarDebito(): void {
    this.router.navigate(['/dashboard/cuentas/debito']);
  }

  navegarTDC(): void {
    this.router.navigate(['/dashboard/cuentas/tdc']);
  }

  nuevaCuenta(): void {
    this.btnNuevaCuenta = false;
    this.router.navigate(['/dashboard/cuentas/debitof']);
  }

  nuevaTDC(): void {
    this.btnNuevaTDC = false;
    this.router.navigate(['/dashboard/cuentas/tdcf']);
  }

  isDebito(): boolean {
    return this.router.url.includes('/dashboard/cuentas/debito');
  }

  isTDC(): boolean {
    return this.router.url.includes('/dashboard/cuentas/tdc');
  }
}
