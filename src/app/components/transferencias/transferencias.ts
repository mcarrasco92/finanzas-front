import { Component, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Subscription } from 'rxjs';
import { CuentasService } from '../../../app/services/cuentas/cuentas';
import { CategoriasService } from '../../services/categorias/categorias';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { Categoria } from '../../models/categoria';
import { Cuenta } from '../../models/cuenta';
import { Tarjeta } from '../../models/tarjeta';
import { Transferencia } from '../../models/transferencia';
import { TransferenciasService } from '../../services/transferencias/transferencias';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { GeneralService } from '../../services/general-service';

@Component({
  selector: 'app-transferencias',
  imports: [CommonModule, FormsModule, ConfirmModal],
  templateUrl: './transferencias.html',
  styleUrl: './transferencias.css'
})
export class Transferencias {
  @Output() cerrar = new EventEmitter<void>();
  @Input() tipo: string = ''; // Propiedad que recibirá el valor desde el padre

  editar: boolean = true;
  confirmModal: boolean = false;

  CuentasSuscription: Subscription | null = null;
  transferenciaSuscription: Subscription | null = null;

  cuentas: Cuenta[] = [];

  importe: string = '';

  valFecha: boolean = false;
  valImporte: boolean = false;
  valConcepto: boolean = false;
  valCuentaOrigen: boolean = false;
  valCuentaDestino: boolean = false;

  transferencia: Transferencia = new Transferencia();
  transferenciaOriginal: Transferencia = new Transferencia();

  constructor(
    private cuentasService: CuentasService,
    private tarjetasService: TarjetasService,
    private transferenciasService: TransferenciasService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private generalService: GeneralService
  ) { }


  ngOnInit() {

    this.generalService.setActualizaPantalla(false);

    const fechaLocal = new Date();
    this.transferencia.fecha = fechaLocal.getFullYear() + '-' +
      String(fechaLocal.getMonth() + 1).padStart(2, '0') + '-' +
      String(fechaLocal.getDate()).padStart(2, '0');

    this.CuentasSuscription = this.cuentasService.cuentasList$.subscribe((cuentas) => {
      this.cuentas = cuentas;
    });

    
    this.transferenciaSuscription = this.transferenciasService.transferenciaId$.subscribe(transferenciaId => {
      if(transferenciaId && transferenciaId != ''){
        this.consultaTransferencia(transferenciaId);  
      }
    });
    

  }


  consultaTransferencia(TransferenciaId: String){
    document.body.style.cursor = 'wait';
    this.transferenciasService.getTransferenciaById(TransferenciaId as string).subscribe(response => {
      document.body.style.cursor = 'default';
      if (response.coderr === '0000') {
        const tran = response.data as Transferencia;
        this.transferencia = Object.assign(new Transferencia(), tran);
        this.transferenciaOriginal = Object.assign(new Transferencia(), tran);

        this.importe = this.transferencia.getImporte();
        if(this.transferencia.id && this.transferencia.id != ''){
          this.editar = false;
        }else{
          this.editar = true;
        }
        this.cdr.detectChanges();
      } else {
        this.toast.show('Error al consultar la transferencia', response.message, TypeToast.danger);
      }
    });
  }



  ngOnDestroy() {
    this.generalService.setActualizaPantalla(true);

    this.CuentasSuscription?.unsubscribe();
    this.transferenciaSuscription?.unsubscribe();
    //this.transferenciasService.setTransferencia(new Transferencia());
    

  }

  enviaDatos() {

    this.actualizaSaldo();

    this.valFecha = this.transferencia.fecha.trim() === '';
    this.valImporte = this.importe.trim() === '';
    this.valConcepto = this.transferencia.concepto.trim() === '';
    this.valCuentaOrigen = this.transferencia.cuentaOrigenId.trim() === '';
    this.valCuentaDestino = this.transferencia.cuentaDestinoId.trim() === '';

    if (this.valFecha || this.valImporte || this.valCuentaOrigen || this.valConcepto || this.valCuentaDestino) {
      return;
    }
    
    
    if(this.transferencia.id && this.transferencia.id != ''){ //Actualiza

      this.transferencia.tipoCuentaDestino ="Cuenta";
      
      console.log(this.transferencia);
      document.body.style.cursor = 'wait';
      this.transferenciasService.actualizaTransferencia( this.transferencia.id ,this.transferencia).subscribe(response => {
        document.body.style.cursor = 'default';
        if (response.coderr === '0000') {
          this.cerrarModal();
          this.toast.show('Transferencia actualizada correctamente', '', TypeToast.success);
        } else {
          this.toast.show('Error al actualizar la transferencia', response.message, TypeToast.danger);
        }
      });
      
    }else{ // Agrega

      this.transferencia.tipoCuentaDestino ="Cuenta";


      console.log(this.transferencia);

      document.body.style.cursor = 'wait';
      this.transferenciasService.addTransferencia(this.transferencia).subscribe(response => {
        document.body.style.cursor = 'default';
        if (response.coderr === '0000') {
          this.cerrarModal()
          this.toast.show('Transferencia generada correctamente', '', TypeToast.success);
        } else {
          this.toast.show('Error al generar la transferencia', response.message, TypeToast.danger);
        }
      });
    }

  }

  eliminaTransferencia() {

    this.confirmModal = false;
    document.body.style.cursor = 'wait';
    this.transferenciasService.deleteTransferencia(this.transferencia.id).subscribe(response => {
      document.body.style.cursor = 'default';
      if (response.coderr === '0000') {
        this.cerrarModal();
        this.toast.show('Transferencia eliminada correctamente', '', TypeToast.success);  
      } else {
        this.toast.show('Error al eliminar la transferencia', response.message, TypeToast.danger);
      }
    });

  }




  formatearSaldo(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    // Obtén la posición actual del cursor
    const cursorPos = input.selectionStart || 0;

    // Elimina caracteres no numéricos y permite solo un punto decimal
    valor = valor.replace(/[^0-9.]/g, ''); // Elimina letras y caracteres no permitidos
    valor = valor.replace(/(\..*)\./g, '$1'); // Permite solo un punto decimal

    // Convierte el valor a número y lo formatea como moneda
    const partes = valor.split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Agrega comas como separadores de miles
    const decimal = partes.length > 1 ? '.' + partes[1].slice(0, 2) : ''; // Limita los decimales a 2 dígitos

    // Actualiza el valor formateado
    this.importe = entero + decimal;

    const numeroDeComas = (this.importe.match(/,/g) || []).length;

    // Calcula el nuevo cursor basado en el formato
    const diff = this.importe.length - valor.length; // Diferencia en longitud después del formato
    const newCursorPos = cursorPos + diff - (this.esBorrado ? numeroDeComas : 0); // Ajusta la posición del cursor considerando las comas y si se borró

    // Actualiza el valor del campo de entrada
    input.value = this.importe;

    // Restaura la posición del cursor
    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  esBorrado: boolean = false;
  detectarTecla(event: KeyboardEvent): void {
    this.esBorrado = event.key === 'Backspace' || event.key === 'Delete';
  }

  actualizaSaldo(): void {
    this.transferencia.setImporte(this.importe);
  }

  cerrarModal(): void {
    setTimeout(() => {
      this.cerrar.emit();
    }, 500);
  }

  cancelaEdicion(): void {
    this.transferencia = Object.assign(new Transferencia(), this.transferenciaOriginal);
    this.importe = this.transferencia.getImporte();
    this.editar = false;
    this.cdr.detectChanges(); 
  }
}
