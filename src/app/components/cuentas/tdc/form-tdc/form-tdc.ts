import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../../shared/toast/toast';
import { ToastService, TypeToast } from '../../../../shared/toast/service/toast-service';
import { Tarjeta } from '../../../../models/tarjeta';
import { TarjetasService } from '../../../../services/tarjetas/tarjetas';
import { ActivatedRoute } from '@angular/router';
import { GeneralService } from '../../../../services/general-service';
import { TransaccionesService } from '../../../../services/transacciones/transacciones';
import { Transaccion } from '../../../../models/transaccion';
import { LeftIcon } from '../../../../shared/icons/left-icon/left-icon';
import { RightIcon } from '../../../../shared/icons/right-icon/right-icon';
import { MesEsPipe } from '../../../../pipes/mes-es-pipe';
import { FilterTipoTransaccionPipe } from '../../../../pipes/filter-tipo-transaccion-pipe';
import { ConfirmModal } from '../../../../shared/confirm-modal/confirm-modal';
import { OptionsMenu } from '../../../../shared/options-menu/options-menu';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-form-tdc',
  imports: [Toast, CommonModule, FormsModule, LeftIcon, RightIcon, MesEsPipe, FilterTipoTransaccionPipe, ConfirmModal, OptionsMenu],
  templateUrl: './form-tdc.html',
  styleUrl: './form-tdc.css'
})
export class FormTDC {

  editar: boolean = false;

  tarjeta: Tarjeta = new Tarjeta();
  tarjetaOriginal: Tarjeta = new Tarjeta();

  transaccionModal: boolean = false;
  confirmModal: boolean = false;
  deleteTransaccionId: string = '';

  valNombre: boolean = false;
  valDescripcion: boolean = false;
  valInstitucion: boolean = false;
  valDpago: boolean = false;
  valDcorte: boolean = false;

  fechaActual: Date = new Date();

  transacciones: Transaccion[] = [];

  tipoMovimiento: String = 'General'

  generalSubscription: Subscription | null = null;


  constructor(private toast: ToastService,
    private tarjetaService: TarjetasService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private transaccionesService: TransaccionesService
  ) { }


  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id'); // Obtiene el parámetro 'id'
    if (id) {
      this.generalService.setScreen('form-tdc-id');
      this.consultaDetalle(id); // Llama a un método para cargar datos con el ID

      let filtro = {
        yearMonth: this.fechaActual.toISOString().slice(0, 7),
        tarjetaId: id
      };

      this.consultaMovimientos(filtro);
    }else {
      this.generalService.setScreen('form-tdc');
      this.tarjeta.limpiar();
      this.tarjetaOriginal.limpiar();
      this.editar = true;
      this.cdr.detectChanges();
    }

    this.generalSubscription = this.generalService.actualizaPantalla$.subscribe(actualiza => {

      let filtro = {
        yearMonth: this.fechaActual.toISOString().slice(0, 7),
        tarjetaId: this.tarjeta.id
      };
  
      this.consultaMovimientos(filtro);
    })


  }

  consultaDetalle(cuentaId: string) {
    this.tarjetaService.getTarjetaById(cuentaId).subscribe(response => {


      if (response.coderr !== "0000") {
        this.toast.show('Error al consultar la tarjeta de crédito', response.message, TypeToast.danger);
        this.cdr.detectChanges();
        return;
      }

      this.tarjeta = Object.assign(new Tarjeta(), response.data);
      this.tarjetaOriginal = Object.assign(new Tarjeta(), response.data);

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
      tarjetaId: this.tarjeta.id
    };

    this.consultaMovimientos(filtro);
  }

  cmabiaTipoMovimiento(tipo: string): void {
    this.tipoMovimiento = tipo;
  }

  consultaTransaccion(transaccion: Transaccion): void {
    this.transaccionesService.setTransaccion(transaccion);
  }

  enviaDatos(): void {

    this.valNombre = this.tarjeta.nombre.trim() === '';
    this.valInstitucion = this.tarjeta.institucion.trim() === '';
    this.valDpago = this.tarjeta.dpago.toString().trim() === '';
    this.valDcorte = this.tarjeta.dcorte.toString().trim() === '';

    if (this.valNombre || this.valInstitucion || this.valDpago || this.valDcorte) {
      return;
    }

    this.editar = false;

    if (this.tarjeta.id) {
      //Actualizar tdc



      this.tarjetaService.updateTarjeta(this.tarjeta.id, {
        nombre: this.tarjeta.nombre,
        descripcion: this.tarjeta.descripcion,
        institucion: this.tarjeta.institucion,
        dpago: this.tarjeta.dpago,
        dcorte: this.tarjeta.dcorte
      }).subscribe(response => {



        if (response.coderr !== "0000") {
          this.toast.show('Error al actualizar la tarjeta de crédito', response.message, TypeToast.danger);
          this.cdr.detectChanges();
          return;
        }

        this.toast.show('Tarjeta actualizada exitosamente', "", TypeToast.success);



        if (response.data && response.data.id) {

          this.tarjeta = Object.assign(new Tarjeta(), response.data);
          this.tarjetaOriginal = Object.assign(new Tarjeta(), response.data);

          this.cdr.detectChanges();
        }

      }, error => {

        this.toast.show('Error al actualizar la tdc', error.error.message, TypeToast.danger);
      });

    } else {

      //Nueva TDC



      this.tarjetaService.addTarjeta(this.tarjeta).subscribe(response => {



        if (response.coderr !== "0000") {
          this.toast.show('Error al registrar la tarjeta', response.message, TypeToast.danger);
          this.cdr.detectChanges();
          return;
        }

        this.toast.show('Tarejta creada exitosamente', "", TypeToast.success);



        if (response.data && response.data.id) {

          this.tarjeta = Object.assign(new Tarjeta(), response.data);
          this.tarjetaOriginal = Object.assign(new Tarjeta(), response.data);

          this.cdr.detectChanges();
        }

      }, error => {

        this.toast.show('Error al crear la tdc', error.error.message, TypeToast.danger);
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

  validarDia(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = parseInt(input.value, 10);

    if (isNaN(valor) || valor < 1) {
      input.value = '';
    } else if (valor > 31) {
      input.value = valor.toString().slice(0, -1);
    }
  }

  activaDesactivaTarjeta(): void {
    if (!this.tarjeta.id) {
      return;
    }



    this.tarjetaService.activaDesactivaTarjeta(this.tarjeta.id, !this.tarjeta.activa).subscribe(response => {

      this.tarjeta.activa = response.data;
      this.tarjetaOriginal.activa = response.data;

      this.cdr.detectChanges();

      this.toast.show('TDC activada exitosamente', "", TypeToast.success);


    }, error => {

      this.toast.show('Error al actualizar la TDC', error.error.message, TypeToast.danger);
    });
  }

  cancelaEdicion(): void {
    this.tarjeta = Object.assign(new Tarjeta(), this.tarjetaOriginal);
    this.editar = false;
  }

  ngOnDestroy() {
    this.toast.clear();
  }

}
