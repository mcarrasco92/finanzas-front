import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../../shared/toast/toast';
import { ToastService, TypeToast } from '../../../../shared/toast/service/toast-service';
import { Subscription } from 'rxjs';
import { CuentasService } from '../../../../services/cuentas/cuentas';
import { Cuenta } from '../../../../models/cuenta';
import { Transaccion } from '../../../../models/transaccion';
import { TransaccionesService } from '../../../../services/transacciones/transacciones';
import { ActivatedRoute } from '@angular/router';
import { GeneralService } from '../../../../services/general-service';
import { LeftIcon } from '../../../../shared/icons/left-icon/left-icon';
import { RightIcon } from '../../../../shared/icons/right-icon/right-icon';
import { MesEsPipe } from '../../../../pipes/mes-es-pipe';
import { FilterTipoTransaccionPipe } from '../../../../pipes/filter-tipo-transaccion-pipe';
import { ConfirmModal } from '../../../../shared/confirm-modal/confirm-modal';
import { OptionsMenu } from '../../../../shared/options-menu/options-menu';

@Component({
  selector: 'app-form-debito',
  imports: [CommonModule, FormsModule, Toast, LeftIcon, RightIcon, MesEsPipe, FilterTipoTransaccionPipe, ConfirmModal, OptionsMenu],
  templateUrl: './form-debito.html',
  styleUrl: './form-debito.css'
})
export class FormDebito {

  constructor(private toast: ToastService,
    private cuentasService: CuentasService,
    private cdr: ChangeDetectorRef,
    private transaccionesService: TransaccionesService,
    private route: ActivatedRoute,
    private generalService: GeneralService
  ) { }

  editar: boolean = false;

  valNombre: boolean = false;
  valDescripcion: boolean = false;
  valInstitucion: boolean = false;
  valSaldo: boolean = false;

  saldo: string = '';

  transaccionModal: boolean = false;
  confirmModal: boolean = false;
  deleteTransaccionId: string = '';

  cuenta: Cuenta = new Cuenta();
  cuentaOriginal: Cuenta = new Cuenta();

  transacciones: Transaccion[] = [];

  fechaActual: Date = new Date();
  tipoMovimiento: String = 'General'

  generalSubscription: Subscription | null = null;



  ngOnInit() {
    //recibir dato desde el path :id
    const id = this.route.snapshot.paramMap.get('id');
    if(id){
      this.generalService.setScreen('form-debito-id');
      this.consultaDetalle(id);

      let filtro = {
        yearMonth: new Date().toISOString().slice(0, 7),
        cuentaId: id
      };

      this.consultaMovimientos(filtro);
    }else{
      this.generalService.setScreen('form-debito');
      this.cuenta.limpiar();
      this.cuentaOriginal.limpiar();
      this.editar = true;
      this.saldo = '';
      this.cdr.detectChanges();
    }

    this.generalSubscription = this.generalService.actualizaPantalla$.subscribe(actualiza => {

      if (!actualiza) {
        return;
      }

      this.consultaDetalle(this.cuenta.id);
      
      let filtro = {
        yearMonth: this.fechaActual.toISOString().slice(0, 7),
        cuentaId: this.cuenta.id
      };
  
      this.consultaMovimientos(filtro);
    })

  }

  ngOnDestroy() {
    this.toast.clear();
    this.generalService.setScreen('');
  }

  consultaDetalle(cuentaId: string): void {
    this.cuentasService.getCuentaById(cuentaId).subscribe(response => {

      if(response.coderr !== "0000"){
        this.toast.show('Error al consultar la cuenta', response.message, TypeToast.danger);
        this.cdr.detectChanges();
        return; 
      }

      this.cuenta = Object.assign(new Cuenta(), response.data);
      this.cuentaOriginal = Object.assign(new Cuenta(), response.data);

      this.saldo = this.cuenta.getSaldo();

      this.cdr.detectChanges();

    });
  }

  consultaMovimientos(filtro: any): void {
    
    this.transacciones = [];
    this.transaccionesService.getTransaccionesByMonth(filtro).subscribe(response => {
      
      if(response.coderr === "0000"){
        this.transacciones = response.data.transacciones
      }
      this.cdr.detectChanges();
    });
  }

  cambiaMes(option: number): void {

    this.fechaActual = new Date(this.fechaActual.setMonth(this.fechaActual.getMonth() + option));

    let filtro = {
      yearMonth: this.fechaActual.toISOString().slice(0, 7),
      cuentaId: this.cuenta.id
    };

    this.consultaMovimientos(filtro);
  }

  cmabiaTipoMovimiento(tipo: string): void {
    this.tipoMovimiento = tipo;
  }

  consultaTransaccion(transaccion: Transaccion): void {
    this.transaccionesService.setTransaccion(transaccion);
  }

  activaDesactivaCuenta(): void {
    if (!this.cuenta.id) {
      return;
    }

    this.cuentasService.activaDesactivaCuenta(this.cuenta.id, !this.cuenta.activa).subscribe(response => {

      this.cuenta.activa = response.data;
      this.cuentaOriginal.activa = response.data;

      this.cdr.detectChanges();

      this.toast.show('Cuenta activada exitosamente', "", TypeToast.success);

    } , error => {
      this.toast.show('Error al actualizar la cuenta', error.error.message, TypeToast.danger);
    });
  }


  enviaDatos(): void {

    this.valNombre = this.cuenta.nombre.trim() === '';

    if (this.valNombre) {
      return;
    }

    this.editar = false;

    if (this.cuenta.id) {
      //Actualizar cuenta

      this.cuentasService.updateCuenta(this.cuenta.id, {
        nombre: this.cuenta.nombre,
        descripcion: this.cuenta.descripcion,
        institucion: this.cuenta.institucion,
        saldo: this.cuenta.saldo,
        vista: this.cuenta.vista,
        inversion: this.cuenta.inversion

      }).subscribe(response => {

        if(response.coderr !== "0000"){
          this.toast.show('Error al actualizar la cuenta', response.message, TypeToast.danger);
          this.cdr.detectChanges();
          return; 
        }

        this.toast.show('Cuenta actualizada exitosamente', "", TypeToast.success);

        console.log(response);

        if (response.data && response.data.id) {

          this.cuenta = Object.assign(new Cuenta(), response.data);
          this.cuentaOriginal = Object.assign(new Cuenta(), response.data);
          this.saldo = this.cuenta.getSaldo();

          this.cdr.detectChanges();
        }

      }, error => {
        this.toast.show('Error al actualizar la cuenta', error.error.message, TypeToast.danger);
      });

    } else {

      //Nueva cuenta

      this.cuentasService.addCuenta(this.cuenta).subscribe(response => {

        if(response.coderr !== "0000"){
          this.toast.show('Error al registrar la cuenta', response.message, TypeToast.danger);
          this.cdr.detectChanges();
          return; 
        }

        this.toast.show('Cuenta creada exitosamente', "", TypeToast.success);

        

        if (response.data && response.data.id) {

          this.cuenta = Object.assign(new Cuenta(), response.data);
          this.cuentaOriginal = Object.assign(new Cuenta(), response.data);
          this.saldo = this.cuenta.getSaldo();

          this.cdr.detectChanges();
        }

      }, error => {
        this.toast.show('Error al crear la cuenta', error.error.message, TypeToast.danger);
      });
    }

  }

  editarTransaccion(trans: any): void {
    console.log('Editar transacción:', trans);
    this.transaccionesService.setTransaccion(trans)
  }

  showConfirmModal(trans: any): void {
    console.log('Borrar transacción');
    this.deleteTransaccionId = trans.id;
    this.confirmModal = true;
  }

  eliminaTransaccion() {

    this.confirmModal = false;

    this.transaccionesService.deleteTransaccion(this.deleteTransaccionId).subscribe(response => {
      if (response.coderr === '0000') {
        this.toast.show('Transacción eliminada correctamente', '', TypeToast.success);
      } else {
        this.toast.show('Error al eliminar la transacción', response.message, TypeToast.danger);
      }
    });

  }

  actualizaSaldo(): void {
    this.cuenta.setSaldo(this.saldo);
  }

  cancelaEdicion(): void {
    this.cuenta = Object.assign(new Cuenta(), this.cuentaOriginal);
    this.saldo = this.cuenta.getSaldo();
    this.editar = false;
  }

  esBorrado: boolean = false; // Variable para rastrear si se presionó una tecla de borrado

  detectarTecla(event: KeyboardEvent): void {
    // Detecta si la tecla presionada es Backspace o Delete
    this.esBorrado = event.key === 'Backspace' || event.key === 'Delete';
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
    this.saldo = entero + decimal;

    const numeroDeComas = (this.saldo.match(/,/g) || []).length;

    // Calcula el nuevo cursor basado en el formato
    const diff = this.saldo.length - valor.length; // Diferencia en longitud después del formato
    const newCursorPos = cursorPos + diff - (this.esBorrado ? numeroDeComas : 0); // Ajusta la posición del cursor considerando las comas y si se borró

    // Actualiza el valor del campo de entrada
    input.value = this.saldo;

    // Restaura la posición del cursor
    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  formatearSaldoDirecto(valor: string): string {
    // Elimina caracteres no numéricos y permite solo un punto decimal
    valor = valor.replace(/[^0-9.]/g, ''); // Elimina letras y caracteres no permitidos
    valor = valor.replace(/(\..*)\./g, '$1'); // Permite solo un punto decimal

    // Convierte el valor a número y lo formatea como moneda
    const partes = valor.split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Agrega comas como separadores de miles
    const decimal = partes.length > 1 ? '.' + partes[1].slice(0, 2) : ''; // Limita los decimales a 2 dígitos

    // Retorna el valor formateado
    return entero + (decimal ? decimal : '.00'); ;
  }


}
