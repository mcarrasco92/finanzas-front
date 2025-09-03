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

@Component({
  selector: 'app-cuentas',
  imports: [CommonModule, Toast, Loading, FormsModule],
  templateUrl: './cuentas.html',
  styleUrl: './cuentas.css'
})
export class Cuentas {

  constructor(private cuentasService: CuentasService, private toast: ToastService, private cdr: ChangeDetectorRef) { }

  isLoading: boolean = false;
  cuentas: ListaCuentasResponse = {} as ListaCuentasResponse;

  ngOnInit() {

    this.isLoading = true;

    this.cuentasService.getCuentas().subscribe(response => {
      console.log(response.data);

      this.cuentas = response.data;;
      console.log('Cuentas cargadas correctamente', this.cuentas);
    }, error => {
      this.toast.show('Error al consultar las cuentas', 'Error: ' + error.status, TypeToast.danger);
      this.isLoading = false;
      this.cdr.detectChanges();
    }, () => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }

    );
  }

  verDetalle(id: string) {
    console.log('Ver detalle de la cuenta con ID:', id);
  }



}
