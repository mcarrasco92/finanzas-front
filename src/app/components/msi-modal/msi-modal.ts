import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MsiService } from '../../services/msi/msi';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Subscription } from 'rxjs';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { Categoria } from '../../models/categoria';
import { Tarjeta } from '../../models/tarjeta';
import { CategoriasService } from '../../services/categorias/categorias';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { MsiModel } from '../../models/msi';
import { GeneralService } from '../../services/general-service';

@Component({
  selector: 'app-msi-modal',
  imports: [CommonModule, FormsModule, ConfirmModal],
  templateUrl: './msi-modal.html',
  styleUrl: './msi-modal.css'
})
export class MsiModal {

  @Output() cerrar = new EventEmitter<void>();

  constructor(
    private categoriasService: CategoriasService,
    private tarjetasService: TarjetasService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private generalService: GeneralService,
    private msiService: MsiService
  ) {}

  editar: boolean = true;
  confirmModal: boolean = false;

  catEgresosSuscription: Subscription | null = null;
  TarejtasSuscription: Subscription | null = null;
  MsiSuscription: Subscription | null = null;

  catEgresos: Categoria[] = [];
  tarjetas: Tarjeta[] = [];

  importe: string = '';

  valFecha: boolean = false;
  valImporte: boolean = false;
  valCatEgreso: boolean = false;
  valTarjeta: boolean = false;
  valDescripcion: boolean = false;
  valConcepto: boolean = false;
  valMeses: boolean = false;

  msi: MsiModel = new MsiModel();
  msiOriginal: MsiModel = new MsiModel();

  ngOnInit(): void {

    this.generalService.setActualizaPantalla(false);

    const fechaLocal = new Date();
    this.msi.fecha = fechaLocal.getFullYear() + '-' +
      String(fechaLocal.getMonth() + 1).padStart(2, '0') + '-' +
      String(fechaLocal.getDate()).padStart(2, '0');

    this.catEgresosSuscription = this.categoriasService.categoriasEgresos$.subscribe(categorias => {
      this.catEgresos = categorias;
    });

    this.TarejtasSuscription = this.tarjetasService.tarjetasList$.subscribe(tarjetas => {
      this.tarjetas = tarjetas;
    });

    this.MsiSuscription = this.msiService.msi$.subscribe(msiId => {
      if(msiId && msiId !== '') {
        if(msiId === '0'){ // Nuevo
          this.importe = '';
          this.editar = true;
          this.cdr.detectChanges();
        }else{ // Editar
          this.msiService.getMsi().subscribe(response =>{
            if(response.coderr === "0000"){
              const msiData = response.data.find((m: MsiModel) => m.id === msiId);
              if(msiData){
                this.msi = Object.assign(new MsiModel(), msiData);
                this.importe = this.msi.getImporte();
                this.msiOriginal = Object.assign(new MsiModel(), msiData);
                this.editar = false;
                this.cdr.detectChanges();
              }else{
                this.toast.show("No se encontró el MSI",'', TypeToast.danger);
              }
            }else{
              this.toast.show("Ocurrio un error al consultar MSI",'', response.message);
            } 
          });
        }
      }
    });

  }

  ngOnDestroy(): void {
    this.generalService.setActualizaPantalla(true);
    this.catEgresosSuscription?.unsubscribe();
    this.TarejtasSuscription?.unsubscribe();
    this.MsiSuscription?.unsubscribe();
  }

  enviaDatos(){
    this.actualizaSaldo();

    this.valFecha = this.msi.fecha.trim() === '';
    this.valImporte = this.importe.trim() === '';
    this.valConcepto = this.msi.concepto.trim() === '';
    this.valCatEgreso = this.msi.catEgresoId.trim() === '';
    this.valTarjeta = this.msi.tarjetaId.trim() === '';
    this.valMeses = this.msi.meses <= 0;
    if (this.valFecha || this.valImporte || this.valConcepto || this.valCatEgreso || this.valTarjeta || this.valMeses) {
      this.toast.show('Por favor, complete todos los campos obligatorios.','', TypeToast.danger);
      return;
    }

    if(this.msi.id && this.msi.id !== ''){ // Actualiza

      document.body.style.cursor = 'wait';
      this.msiService.updateMsi(this.msi.id ,this.msi).subscribe(response => {
        document.body.style.cursor = 'default';
        if (response.coderr === '0000') {
          this.cerrarModal()
          this.toast.show('MSI actualizado correctamente', '', TypeToast.success);
        } else {
          this.toast.show('Error al actualizar el MSI', response.message, TypeToast.danger);
        }
      });

    }else{ // Nuevo
      document.body.style.cursor = 'wait';
      this.msiService.addMsi(this.msi).subscribe(response => {
        document.body.style.cursor = 'default';
        if (response.coderr === '0000') {
          this.cerrarModal()
          this.toast.show('MSI agregados correctamente', '', TypeToast.success);
        } else {
          this.toast.show('Error al agregar los MSI', response.message, TypeToast.danger);
        }
      });
    }

  }

  eliminaMsi() {
    this.confirmModal = false;
    document.body.style.cursor = 'wait';

    this.msiService.deleteMsi(this.msi.id).subscribe(response => {
      document.body.style.cursor = 'default';
      if (response.coderr === '0000') {
        this.cerrarModal();
        this.toast.show('Compra a MSI eliminada correctamente', '', TypeToast.success);  
      } else {
        this.toast.show('Error al eliminar la compra a MSI', response.message, TypeToast.danger);
      }
    });
    
  }

  cerrarModal() {
    this.cerrar.emit();
  }


  cancelaEdicion(): void {
    this.msi = Object.assign(new MsiModel(), this.msiOriginal);
    this.importe = this.msi.getImporte();
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

  validarMeses(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = parseInt(input.value, 10);
    if (isNaN(valor) || valor < 1) {
      input.value = '';
      this.msi.meses = 0;
    } else {
      this.msi.meses = valor;
    }
  }

  actualizaSaldo(): void {
    this.msi.setImporte(this.importe);
  }

}
