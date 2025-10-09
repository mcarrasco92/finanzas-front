import { Component, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Loading } from '../../shared/loading/loading';
import { Toast } from '../../shared/toast/toast';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Subscription } from 'rxjs';
import { CuentasService } from '../../../app/services/cuentas/cuentas';
import { CategoriasService } from '../../services/categorias/categorias';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { Categoria } from '../../models/categoria';
import { Cuenta } from '../../models/cuenta';
import { Tarjeta } from '../../models/tarjeta';
import { Transaccion } from '../../models/transaccion';
import { TransaccionesService } from '../../services/transacciones/transacciones';
import { TrashIcon } from '../../shared/icons/trash-icon/trash-icon';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { GeneralService } from '../../services/general-service';
import { time } from 'console';

@Component({
  selector: 'app-transacciones',
  imports: [CommonModule, FormsModule, Loading, Toast, TrashIcon, ConfirmModal],
  templateUrl: './transacciones.html',
  styleUrl: './transacciones.css'
})
export class Transacciones {
  @Output() cerrar = new EventEmitter<void>();
  @Input() tipo: string = ''; // Propiedad que recibirá el valor desde el padre

  isLoading: boolean = false;
  editar: boolean = true;
  confirmModal: boolean = false;

  catEgresosSuscription: Subscription | null = null;
  catIngresosSuscription: Subscription | null = null;
  CuentasSuscription: Subscription | null = null;
  TarejtasSuscription: Subscription | null = null;
  transaccionSuscription: Subscription | null = null;

  catEgresos: Categoria[] = [];
  catIngresos: Categoria[] = [];
  cuentas: Cuenta[] = [];
  tarjetas: Tarjeta[] = [];
  cuentasYTarjetas: string = '';

  importe: string = '';

  valFecha: boolean = false;
  valImporte: boolean = false;
  valCatIngreso: boolean = false;
  valCatEgreso: boolean = false;
  valCuenta: boolean = false;
  valCuentaTarjeta: boolean = false;
  valDescripcion: boolean = false;
  valConcepto: boolean = false;
  valNecesario: boolean = false;

  transaccion: Transaccion = new Transaccion();
  transaccionOriginal: Transaccion = new Transaccion();

  constructor(
    private cuentasService: CuentasService,
    private categoriasService: CategoriasService,
    private tarjetasService: TarjetasService,
    private transaccionesService: TransaccionesService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private generalService: GeneralService
  ) { }


  ngOnInit() {

    this.generalService.setActualizaPantalla(false);

    const fechaLocal = new Date();
    this.transaccion.fecha = fechaLocal.getFullYear() + '-' +
      String(fechaLocal.getMonth() + 1).padStart(2, '0') + '-' +
      String(fechaLocal.getDate()).padStart(2, '0');

    this.catEgresosSuscription = this.categoriasService.categoriasEgresos$.subscribe((egresos) => {
      this.catEgresos = egresos;
    });
    this.catIngresosSuscription = this.categoriasService.categoriasIngresos$.subscribe((ingresos) => {
      this.catIngresos = ingresos;
    });

    this.CuentasSuscription = this.cuentasService.cuentasList$.subscribe((cuentas) => {
      this.cuentas = cuentas;
    });
    this.TarejtasSuscription = this.tarjetasService.tarjetasList$.subscribe((tarjetas) => {
      this.tarjetas = tarjetas;
    });
    document.body.style.cursor = 'wait';
    this.transaccionSuscription = this.transaccionesService.transaccion$.subscribe(tran => {
      document.body.style.cursor = 'default';
      if (tran.id !== '') {
        this.transaccion = Object.assign(new Transaccion(), tran);
        this.transaccionOriginal = Object.assign(new Transaccion(), tran);

        this.importe = this.transaccion.getImporte();
        if (this.transaccion.tipo == 'Egreso') {
          if (this.transaccion.cuentaId != '') {
            this.cuentasYTarjetas = 'C' + this.transaccion.cuentaId;
          } else if (this.transaccion.tarjetaId != '') {
            this.cuentasYTarjetas = 'T' + this.transaccion.tarjetaId;
          } else {
            this.cuentasYTarjetas = '';
          }
        }
        this.editar = false;
      }
      this.cdr.detectChanges();
    });

  }

  ngOnDestroy() {
    this.generalService.setActualizaPantalla(true);


    this.catEgresosSuscription?.unsubscribe();
    this.catIngresosSuscription?.unsubscribe();
    this.CuentasSuscription?.unsubscribe();
    this.TarejtasSuscription?.unsubscribe();
    this.transaccionSuscription?.unsubscribe();
    this.transaccionesService.setTransaccion(new Transaccion());
    

  }

  enviaDatos() {

    this.valFecha = this.transaccion.fecha.trim() === '';
    this.valImporte = this.importe.trim() === '';
    this.valConcepto = this.transaccion.concepto.trim() === '';

    if (this.tipo == 'Egreso') {
      this.valCatEgreso = this.transaccion.catEgresoId.trim() === '';
      this.valCuentaTarjeta = this.cuentasYTarjetas.trim() === '';
      this.valNecesario = this.transaccion.necesario === '';


      if (this.valFecha || this.valImporte || this.valCatEgreso || this.valCuentaTarjeta || this.valConcepto || this.valNecesario) {
        return;
      }

      if (this.cuentasYTarjetas.startsWith('T')) {
        this.transaccion.tarjetaId = this.cuentasYTarjetas.substring(1);
        this.transaccion.cuentaId = '';
      } else if (this.cuentasYTarjetas.startsWith('C')) {
        this.transaccion.cuentaId = this.cuentasYTarjetas.substring(1);
        this.transaccion.tarjetaId = '';
      }

    } else if (this.tipo == 'Ingreso') {
      this.valCatIngreso = this.transaccion.catIngresoId.trim() === '';
      this.valCuenta = this.transaccion.cuentaId.trim() === '';

      if (this.valFecha || this.valImporte || this.valCatIngreso || this.valCuenta || this.valConcepto) {
        return;
      }
    }
    
    
    if(this.transaccion.id && this.transaccion.id != ''){ //Actualiza
      document.body.style.cursor = 'wait';
      this.transaccionesService.updateTransaccion( this.transaccion.id ,this.transaccion).subscribe(response => {
        document.body.style.cursor = 'default';
        if (response.coderr === '0000') {
          this.cerrarModal();
          this.toast.show('Transacción actualizada correctamente', '', TypeToast.success);
        } else {
          this.toast.show('Error al actualizar la transacción', response.message, TypeToast.danger);
        }
      });
      
    }else{ // Agrega

      this.transaccion.tipo = this.tipo;
      document.body.style.cursor = 'wait';
      this.transaccionesService.addTransaccion(this.transaccion).subscribe(response => {
        document.body.style.cursor = 'default';
        if (response.coderr === '0000') {
          this.cerrarModal()
          this.toast.show('Transacción agregada correctamente', '', TypeToast.success);
        } else {
          this.toast.show('Error al agregar la transacción', response.message, TypeToast.danger);
        }
      });
    }

  }

  eliminaTransaccion() {

    this.confirmModal = false;
    document.body.style.cursor = 'wait';
    this.transaccionesService.deleteTransaccion(this.transaccion.id).subscribe(response => {
      document.body.style.cursor = 'default';
      if (response.coderr === '0000') {
        this.cerrarModal();
        this.toast.show('Transacción eliminada correctamente', '', TypeToast.success);  
      } else {
        this.toast.show('Error al eliminar la transacción', response.message, TypeToast.danger);
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
    this.transaccion.setImporte(this.importe);
  }

  cerrarModal(): void {
    setTimeout(() => {
      this.cerrar.emit();
    }, 500);
  }

  cancelaEdicion(): void {
    this.transaccion = this.transaccionOriginal;
    this.importe = this.transaccion.getImporte();
    if (this.transaccion.tipo == 'Egreso') {
      if (this.transaccion.cuentaId != '') {
        this.cuentasYTarjetas = 'C' + this.transaccion.cuentaId;
      } else if (this.transaccion.tarjetaId != '') {
        this.cuentasYTarjetas = 'T' + this.transaccion.tarjetaId;
      } else {
        this.cuentasYTarjetas = '';
      }
    }
    this.editar = false;
    this.cdr.detectChanges(); 
  }
}
