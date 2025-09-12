import { Component } from '@angular/core';
import { CuentasService } from '../../services/cuentas/cuentas';
import { CommonModule } from '@angular/common';
import { ListaCuentasResponse } from '../interfaces/cuentas';
import { error } from 'console';
import { Toast } from '../../shared/toast/toast';
import { ToastService, TypeToast, typToast } from '../../shared/toast/service/toast-service';
import { Loading } from '../../shared/loading/loading';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink, Router } from '@angular/router';
import { DataService } from './debito/service/data-service';

@Component({
  selector: 'app-cuentas',
  imports: [CommonModule, Toast, Loading, FormsModule, RouterOutlet, RouterLink],
  templateUrl: './cuentas.html',
  styleUrl: './cuentas.css'
})
export class Cuentas {

  constructor(private cuentasService: CuentasService, 
    private toast: ToastService, 
    private cdr: ChangeDetectorRef,
  private dataService: DataService,
private router: Router) { }

  isLoading: boolean = false;
  agregaCuenta: boolean = true;

  ngOnInit(): void {
    this.agregaCuenta = true;
    
    this.cdr.detectChanges();
  }


  toggleAgregaCuenta(): void {
    this.agregaCuenta = !this.agregaCuenta;
  }


  nuevaCuenta() {
    this.dataService.setData(null);
    this.router.navigate(['/dashboard/cuentas/debitof']);
  }




}
