import { Component, Output, EventEmitter, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Subscription } from 'rxjs';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { Categoria } from '../../models/categoria';
import { Tarjeta } from '../../models/tarjeta';
import { CategoriasService } from '../../services/categorias/categorias';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { CuentasService } from '../../services/cuentas/cuentas';
import { TransaccionesRecurrentesService } from '../../services/transacciones-recurrentes/transacciones-recurrentes';
import { GeneralService } from '../../services/general-service';
import { TransaccionRecurrenteModel } from '../../models/transaccion-recurrente';
import { Cuenta } from '../../models/cuenta';

@Component({
  selector: 'app-transacciones-recurrentes-modal',
  imports: [CommonModule, FormsModule, ConfirmModal],
  templateUrl: './transacciones-recurrentes-modal.html',
  styleUrl: './transacciones-recurrentes-modal.css'
})
export class TransaccionesRecurrentesModal {
  @Output() cerrar = new EventEmitter<void>();
  @Input() tipoMovimiento: string = '';
  
    constructor(
      private categoriasService: CategoriasService,
      private tarjetasService: TarjetasService,
      private toast: ToastService,
      private cdr: ChangeDetectorRef,
      private generalService: GeneralService,
      private transaccionesRecurrentesService: TransaccionesRecurrentesService,
      private cuentasService: CuentasService
    ) {}
  
    editar: boolean = true;
    confirmModal: boolean = false;
  
    catEgresosSuscription: Subscription | null = null;
    catIngresosSuscription: Subscription | null = null;
    TarejtasSuscription: Subscription | null = null;
    CuentasSuscription: Subscription | null = null;
  
    catEgresos: Categoria[] = [];
    catIngresos: Categoria[] = [];
    tarjetas: Tarjeta[] = [];
    cuentas: Cuenta[] = [];
    cuentasYTarjetas: string = '';
  
    importe: string = '';
  
    valFecha: boolean = false;
    valFechaActual: boolean = false;
    valImporte: boolean = false;
    valCatEgreso: boolean = false;
    valDescripcion: boolean = false;
    valConcepto: boolean = false;
    valCuentaTarjeta: boolean = false;
    valCatIngreso: boolean = false;
    valCuenta: boolean = false;
    valPeriodicidad: boolean = false;
    valDia: boolean = false;
    

    transRec: TransaccionRecurrenteModel = new TransaccionRecurrenteModel();
    transRecOriginal: TransaccionRecurrenteModel = new TransaccionRecurrenteModel();

  
    ngOnInit(): void {
  
      this.generalService.setActualizaPantalla(false);
  
      const fechaLocal = new Date();
      this.transRec.fecha = fechaLocal.getFullYear() + '-' +
        String(fechaLocal.getMonth() + 1).padStart(2, '0') + '-' +
        String(fechaLocal.getDate()).padStart(2, '0');
  
      this.catEgresosSuscription = this.categoriasService.categoriasEgresos$.subscribe(categorias => {
        this.catEgresos = categorias;
      });

      this.catIngresosSuscription = this.categoriasService.categoriasIngresos$.subscribe(categorias => {
        this.catIngresos = categorias;
      });
  
      this.TarejtasSuscription = this.tarjetasService.tarjetasList$.subscribe(tarjetas => {
        this.tarjetas = tarjetas;
      });

      this.CuentasSuscription = this.cuentasService.cuentasList$.subscribe((cuentas) => {
        this.cuentas = cuentas;
      });
  
      this.transaccionesRecurrentesService.transaccionRecurrente$.subscribe(trans => {
        if(trans) {
          if(trans.id === ''){ // Nuevo
            this.importe = '';
            this.editar = true;
            this.cdr.detectChanges();
          }else{ // Editar

            this.transRec = Object.assign(new TransaccionRecurrenteModel(), trans);
            this.importe = this.transRec.getImporte();
            this.transRecOriginal = Object.assign(new TransaccionRecurrenteModel(), trans);
              if (this.transRec.cuentaId != '') {
                this.cuentasYTarjetas = 'C' + this.transRec.cuentaId;
              } else if (this.transRec.tarjetaId != '') {
                this.cuentasYTarjetas = 'T' + this.transRec.tarjetaId;
              } else {
                this.cuentasYTarjetas = '';
            }


            this.editar = false;
            this.cdr.detectChanges();
          }
        }
      });
  
    }
  
    ngOnDestroy(): void {
      this.generalService.setActualizaPantalla(true);
      this.catEgresosSuscription?.unsubscribe();
      this.TarejtasSuscription?.unsubscribe();
      this.CuentasSuscription?.unsubscribe();
    }
  
    enviaDatos(){
      this.actualizaSaldo();
  
      
      this.valImporte = this.importe.trim() === '';
      this.valConcepto = this.transRec.concepto.trim() === '';
      this.valDescripcion = this.transRec.descripcion.trim() === '';
      this.valCatEgreso = this.transRec.catEgresoId.trim() === '';
      this.valCuentaTarjeta = this.cuentasYTarjetas.trim() === '';
      this.valPeriodicidad = this.transRec.periodicidad.trim() === '';

      if(this.transRec.periodicidad === 'Semanal'){
        this.valDia = this.transRec.dia.trim() === '';
      }else{
        this.valFecha = this.transRec.fecha.trim() === '';

        // Validar si la fecha es mayor o igual a la fecha actual
        const fechaActual = new Date();
        // Convertir la fecha de la transacción a local correctamente
        const partes = this.transRec.fecha.split('-'); // ["2025", "11", "19"]
        const fechaTransaccion = new Date(
          Number(partes[0]),
          Number(partes[1]) - 1, // Mes base 0
          Number(partes[2])
        );

        if (fechaTransaccion < new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate())) {
          this.valFechaActual = true;
        } else {
          this.valFechaActual = false;
        } 

      }
  
      if (this.tipoMovimiento == 'Egreso') {
        this.valCatEgreso = this.transRec.catEgresoId.trim() === '';
        this.valCuentaTarjeta = this.cuentasYTarjetas.trim() === '';
        if (this.valFecha || this.valImporte || this.valCatEgreso || this.valCuentaTarjeta || this.valConcepto) {
          return;
        }
  
        if (this.cuentasYTarjetas.startsWith('T')) {
          this.transRec.tarjetaId = this.cuentasYTarjetas.substring(1);
          this.transRec.cuentaId = '';
        } else if (this.cuentasYTarjetas.startsWith('C')) {
          this.transRec.cuentaId = this.cuentasYTarjetas.substring(1);
          this.transRec.tarjetaId = '';
        }
  
      } else if (this.tipoMovimiento == 'Ingreso') {
        this.valCatIngreso = this.transRec.catIngresoId.trim() === '';
        this.valCuenta = this.transRec.cuentaId.trim() === '';
  
        if (this.valFecha || this.valImporte || this.valCatIngreso || this.valCuenta || this.valConcepto) {
          return;
        }
      }

      this.transRec.tipo = this.tipoMovimiento;
  
      if(this.transRec.id && this.transRec.id !== ''){ // Actualiza
  
        document.body.style.cursor = 'wait';
        this.transaccionesRecurrentesService.updateTransaccionRecurrente(this.transRec.id ,this.transRec).subscribe(response => {
          document.body.style.cursor = 'default';
          if (response.coderr === '0000') {
            this.cerrarModal()
            this.toast.show('Movimiento actualizado correctamente', '', TypeToast.success);
          } else {
            this.toast.show('Error al actualizar el movimiento', response.message, TypeToast.danger);
          }
        });
  
      }else{ // Nuevo
        document.body.style.cursor = 'wait';
        this.transaccionesRecurrentesService.addTransaccionRecurrente(this.transRec).subscribe(response => {
          document.body.style.cursor = 'default';
          if (response.coderr === '0000') {
            this.cerrarModal()
            this.toast.show('Movimiento agregado correctamente', '', TypeToast.success);
          } else {
            this.toast.show('Error al agregar el movimiento', response.message, TypeToast.danger);
          }
        });
      }
  
    }
  
    eliminaTransaccionRecurrente() {
      this.confirmModal = false;
      document.body.style.cursor = 'wait';
  
      this.transaccionesRecurrentesService.deleteTransaccionRecurrente(this.transRec.id).subscribe(response => {
        document.body.style.cursor = 'default';
        if (response.coderr === '0000') {
          this.cerrarModal();
          this.toast.show('Movimiento eliminado correctamente', '', TypeToast.success);  
        } else {
          this.toast.show('Error al eliminar el movimiento', response.message, TypeToast.danger);
        }
      });
      
    }
  
    cerrarModal() {
      this.cerrar.emit();
    }
  
  
    cancelaEdicion(): void {
      this.transRec = Object.assign(new TransaccionRecurrenteModel(), this.transRecOriginal);
      this.importe = this.transRec.getImporte();
      if (this.transRec.cuentaId != '') {
        this.cuentasYTarjetas = 'C' + this.transRec.cuentaId;
      } else if (this.transRec.tarjetaId != '') {
        this.cuentasYTarjetas = 'T' + this.transRec.tarjetaId;
      } else {
        this.cuentasYTarjetas = '';
      }
      this.editar = false;
      this.cdr.detectChanges(); 
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
      this.transRec.setImporte(this.importe);
    }
}
