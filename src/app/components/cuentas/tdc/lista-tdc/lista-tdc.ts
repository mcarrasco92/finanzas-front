import { Component } from '@angular/core';
import { ToastService, TypeToast, typToast } from '../../../../shared/toast/service/toast-service';
import { Loading } from '../../../../shared/loading/loading';
import { Toast } from '../../../../shared/toast/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-tdc',
  imports: [Toast, Loading, CommonModule, FormsModule],
  templateUrl: './lista-tdc.html',
  styleUrl: './lista-tdc.css'
})
export class ListaTDC {

  constructor(private toast: ToastService){

  }


  cuentasDesactivadas: boolean = false;
  isLoading: boolean = false;

}
