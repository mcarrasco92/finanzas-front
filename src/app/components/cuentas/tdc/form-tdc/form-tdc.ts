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
import { Router } from '@angular/router';
import { Transferencia } from '../../../../models/transferencia';
import { TransferenciasService } from '../../../../services/transferencias/transferencias';
import { CategoriasService } from '../../../../services/categorias/categorias';
import { Categoria } from '../../../../models/categoria';
import { MsiService } from '../../../../services/msi/msi';


@Component({
  selector: 'app-form-tdc',
  imports: [Toast, CommonModule, FormsModule, LeftIcon, RightIcon, MesEsPipe, FilterTipoTransaccionPipe, ConfirmModal, OptionsMenu],
  templateUrl: './form-tdc.html',
  styleUrl: './form-tdc.css'
})
export class FormTDC {

  editar: boolean = false;
  modalPagar: boolean = false;

  tarjeta: Tarjeta = new Tarjeta();
  tarjetaOriginal: Tarjeta = new Tarjeta();

  transaccionModal: boolean = false;
  confirmModal: boolean = false;
  confirmModalEliminaTarjeta: boolean = false;
  deleteTransaccionId: string = '';

  valNombre: boolean = false;
  valDescripcion: boolean = false;
  valInstitucion: boolean = false;
  valDpago: boolean = false;
  valDcorte: boolean = false;
  valOtroSaldo: boolean = false;

  fechaActual: Date = new Date();

  transacciones: Transaccion[] = [];

  tipoMovimiento: String = 'General'
  cargandoMovimientos: boolean = false;

  generalSubscription: Subscription | null = null;
  categoriasIngresosSuscription : Subscription | null = null;
  categoriasEgresosSuscription : Subscription | null = null;

  categoriasIngresos: Categoria[] = [];
  categoriasEgresos: Categoria[] = [];

  agrupadosPorFecha: { [key: string]: Transaccion[] } = {};
  totalIngresos: number = 0;
  totalEgresos: number = 0;
  balance: number = 0;

  pagoSeleccionado: string = 'pagoPendiente'; // Valor inicial
  otroSaldo: string = '';


  constructor(private toast: ToastService,
    private tarjetaService: TarjetasService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private transaccionesService: TransaccionesService,
    private router: Router,
    private transferenciaService: TransferenciasService,
    private categoriasService: CategoriasService,
    private msiService: MsiService
  ) { }

  getFechas(): string[] {
    return Object.keys(this.agrupadosPorFecha).filter(fecha => {
      const transacciones = this.agrupadosPorFecha[fecha];
      return transacciones.some(t => t.tipo + 's' === this.tipoMovimiento || this.tipoMovimiento === 'General');
    });
  }

  getRangoFechaCorte(): string[] {
    // Obtener el día de corte como un entero
    const diaCorte = parseInt(this.tarjeta.dcorte.toString(), 10);

    // Obtener la fecha actual
    const fechaActual = new Date(this.fechaActual);

    // Calcular la fecha de inicio
    let fechaInicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), diaCorte);
    fechaInicio.setDate(fechaInicio.getDate() + 1); // Sumar 1 día para incluir el día de corte

    if (fechaActual.getDate() < diaCorte) {
      // Si el día actual es menor que el día de corte, retroceder un mes
      fechaInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() - 1, fechaInicio.getDate());
    }

    // Calcular la fecha de fin (un mes después de la fecha de inicio)
    const fechaFin = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 1, diaCorte);

    // Convertir las fechas al formato "YYYY-MM-DD"
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
    const fechaFinStr = fechaFin.toISOString().split('T')[0];

    let fechas = [];
    fechas.push(fechaInicioStr);
    fechas.push(fechaFinStr);
    
    return fechas;
  }

  pagar(){

    if(this.pagoSeleccionado === 'otro'){
      if(this.otroSaldo.trim() === '' || isNaN(Number(this.otroSaldo.replace(/,/g, ''))) || Number(this.otroSaldo.replace(/,/g, '')) <= 0){
        this.valOtroSaldo = true;
        return;
      }
    }

    let pago: Transferencia  = new Transferencia();
    pago.tipoCuentaDestino = 'Tarjeta';
    pago.importe = this.pagoSeleccionado === 'saldoTotal' ? this.tarjeta.saldo : (this.pagoSeleccionado === 'pagoPendiente' ? this.tarjeta.pagoPendiente : Number(this.otroSaldo.replace(/,/g, '')));


    pago.fecha = this.fechaActual.getFullYear() + '-' +
      String(this.fechaActual.getMonth() + 1).padStart(2, '0') + '-' +
      String(this.fechaActual.getDate()).padStart(2, '0');
    pago.cuentaDestinoId = this.tarjeta.id;

    this.transferenciaService.setTransferencia(pago);

  }

  cerrarModalPagar(){
    this.modalPagar = false;
  }

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id'); // Obtiene el parámetro 'id'
    if (id) {
      this.generalService.setScreen('form-tdc-id');

      this.categoriasIngresosSuscription = this.categoriasService.categoriasIngresos$.subscribe(categorias => {
        this.categoriasIngresos = categorias;
        this.cdr.detectChanges();
      });
  
      this.categoriasEgresosSuscription = this.categoriasService.categoriasEgresos$.subscribe(categorias => {
        this.categoriasEgresos = categorias;
        this.cdr.detectChanges();
      });


      this.consultaDetalle(id); // Llama a un método para cargar datos con el ID
    }else {
      this.generalService.setScreen('form-tdc');
      this.tarjeta.limpiar();
      this.tarjetaOriginal.limpiar();
      this.editar = true;
      this.cdr.detectChanges();
    }

    this.generalSubscription = this.generalService.actualizaPantalla$.subscribe(actualiza => {
      actualiza ? this.consultaDetalle(this.tarjeta.id) : null;
    })


  }

  agrupaRegistos(){
    this.agrupadosPorFecha = this.transacciones.reduce((acc: any, transaccion) => {
      //const fecha = new Date(transaccion.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      const fecha = transaccion.fecha;
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(transaccion);
      return acc;
    }, {});
  }

  getSumaImportes(fecha: string): number {
    const movimientos = this.agrupadosPorFecha[fecha].filter(trans => 
      trans.tipo + 's' === this.tipoMovimiento || this.tipoMovimiento === 'General'
    );
    return movimientos.reduce((acc, trans) => {
      if(this.tipoMovimiento === 'General'){
        if(trans.tipo === 'Ingreso'){
          acc += trans.importe;
        }else if(trans.tipo === 'Egreso'){
          acc -= trans.importe;
        }
      }else{
        acc += trans.importe;
      }
      return acc;
    }, 0);

  }

  consultaDetalle(tarjetaId: string) {
    document.body.style.cursor = 'wait';
    this.tarjetaService.getTarjetaById(tarjetaId).subscribe(response => {
      document.body.style.cursor = 'default';


      if (response.coderr !== "0000") {
        this.toast.show('Error al consultar la tarjeta de crédito', response.message, TypeToast.danger);
        this.cdr.detectChanges();
        return;
      }

      this.tarjeta = Object.assign(new Tarjeta(), response.data);
      this.tarjetaOriginal = Object.assign(new Tarjeta(), response.data);

      let filtro = {
        fechaInicio: this.getRangoFechaCorte()[0],
        fechaFin: this.getRangoFechaCorte()[1],
        tarjetaId: this.tarjeta.id
      };

      this.consultaMovimientos(filtro);

      this.cdr.detectChanges();


    });
  }

  consultaMovimientos(filtro: any): void {
    
    this.transacciones = [];
    this.totalIngresos = 0;
    this.totalEgresos = 0;
    this.balance = 0;
    this.agrupadosPorFecha = {};
    this.cargandoMovimientos = true;

    this.transaccionesService.getTransaccionesByMonth(filtro).subscribe(response => {
      this.cargandoMovimientos = false;
      
      if(response.coderr === "0000"){
        this.transacciones = response.data.transacciones
        this.totalIngresos = this.transacciones.filter(t => t.tipo === 'Ingreso').reduce((acc, t) => acc + t.importe, 0);
        this.totalEgresos = this.transacciones.filter(t => t.tipo === 'Egreso').reduce((acc, t) => acc + t.importe, 0);
        this.balance = this.totalIngresos - this.totalEgresos;
        this.transacciones.sort((a, b) => b.fecha.localeCompare(a.fecha));
        this.agrupaRegistos()
      }
      this.cdr.detectChanges();
    });
  }

  getDescripcionCategoria(transaccion: Transaccion): string {
    let categoria = null;
    if(transaccion.tipo === 'Ingreso'){
      categoria = this.categoriasIngresos.find(cat => cat.id === transaccion.catIngresoId);  
    }else if(transaccion.tipo === 'Egreso'){
      categoria = this.categoriasEgresos.find(cat => cat.id === transaccion.catEgresoId);
    }else{
      return '';
    }

    return categoria ? categoria.nombre : '-';
  }

  cambiaMes(option: number): void {

    this.fechaActual = new Date(this.fechaActual.setMonth(this.fechaActual.getMonth() + option));

    let filtro = {
      fechaInicio: this.getRangoFechaCorte()[0],
      fechaFin: this.getRangoFechaCorte()[1],
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


      document.body.style.cursor = 'wait';
      this.tarjetaService.updateTarjeta(this.tarjeta.id, {
        nombre: this.tarjeta.nombre,
        descripcion: this.tarjeta.descripcion,
        institucion: this.tarjeta.institucion,
        dpago: this.tarjeta.dpago,
        dcorte: this.tarjeta.dcorte
      }).subscribe(response => {
        document.body.style.cursor = 'default';


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


      document.body.style.cursor = 'wait';
      this.tarjetaService.addTarjeta(this.tarjeta).subscribe(response => {
        document.body.style.cursor = 'default';


        if (response.coderr !== "0000") {
          this.toast.show('Error al registrar la tarjeta', response.message, TypeToast.danger);
          this.cdr.detectChanges();
          return;
        }

        this.toast.show('Tarjeta creada exitosamente', "", TypeToast.success);



        if (response.data && response.data.id) {

          this.router.navigate(['/dashboard/cuentas/tdcf/' + response.data.id]);
        }

      }, error => {

        this.toast.show('Error al crear la tdc', error.error.message, TypeToast.danger);
      });
    }

  }


  editarTransaccion(trans: any): void {
    if(!this.tarjeta.activa){
      return;
    }

    if(trans.transferencia){
      let pago = new Transferencia();
      pago.id = trans.id;
      pago.tipoCuentaDestino = 'Tarjeta';
      this.transferenciaService.setTransferencia(pago)
    }else if(trans.msiId && trans.msiId !== ''){
      this.msiService.setMsi(trans.msiId);
    }else{
      this.transaccionesService.setTransaccion(trans)
    }
    
  }

  showConfirmModal(trans: any): void {
    console.log('Borrar transacción');
    this.deleteTransaccionId = trans.id;
    this.confirmModal = true;
  }

  showConfirmModalEliminarTarjeta(): void {
    this.confirmModalEliminaTarjeta = true;
  }

  eliminaTransaccion() {

    this.confirmModal = false;
    document.body.style.cursor = 'wait';
    this.transaccionesService.deleteTransaccion(this.deleteTransaccionId).subscribe(response => {
      document.body.style.cursor = 'default';
      if (response.coderr === '0000') {
        this.toast.show('Transacción eliminada correctamente', '', TypeToast.success);
        this.consultaDetalle(this.tarjeta.id);
      } else {
        this.toast.show('Error al eliminar la transacción', response.message, TypeToast.danger);
      }
    });

  }

  eliminaTarjeta(): void {

    if (!this.tarjeta.id) {
      return;
    }

    this.confirmModalEliminaTarjeta = false;
    document.body.style.cursor = 'wait';
    this.tarjetaService.deleteTarjeta(this.tarjeta.id).subscribe(response => {
      document.body.style.cursor = 'default';
      if (response.coderr === '0000') {
        this.toast.show('Tarjeta eliminada correctamente', '', TypeToast.success);
        this.router.navigate(['/dashboard/cuentas/tdc']);
      } else {
        this.toast.show('Error al eliminar la tarjeta', response.message, TypeToast.danger);
      }
    });

  } 

  validarDia(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = parseInt(input.value, 10);

    if (isNaN(valor) || valor < 1) {
      input.value = '';
    } else if (valor > 28) {
      input.value = '28';
    }
  }

  activaDesactivaTarjeta(): void {
    if (!this.tarjeta.id) {
      return;
    }


    document.body.style.cursor = 'wait';
    this.tarjetaService.activaDesactivaTarjeta(this.tarjeta.id, !this.tarjeta.activa).subscribe(response => {
      document.body.style.cursor = 'default';

      this.tarjeta.activa = response.data;
      this.tarjetaOriginal.activa = response.data;

      this.cdr.detectChanges();

      if(this.tarjeta.activa){
        this.toast.show('TDC activada exitosamente', "", TypeToast.success);
      }else{
        this.toast.show('TDC desactivada exitosamente', "", TypeToast.success);
      }
      


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
    this.generalService.setScreen('');
    this.generalSubscription?.unsubscribe();
    this.categoriasIngresosSuscription?.unsubscribe();
    this.categoriasEgresosSuscription?.unsubscribe();
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
    this.otroSaldo = entero + decimal;

    const numeroDeComas = (this.otroSaldo.match(/,/g) || []).length;

    // Calcula el nuevo cursor basado en el formato
    const diff = this.otroSaldo.length - valor.length; // Diferencia en longitud después del formato
    const newCursorPos = cursorPos + diff - (this.esBorrado ? numeroDeComas : 0); // Ajusta la posición del cursor considerando las comas y si se borró

    // Actualiza el valor del campo de entrada
    input.value = this.otroSaldo;

    // Restaura la posición del cursor
    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

}
