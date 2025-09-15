import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../../shared/toast/toast';
import { ToastService, TypeToast } from '../../../../shared/toast/service/toast-service';
import  {Loading} from '../../../../shared/loading/loading';
import { Tarjeta } from '../../../../models/tarjeta';
import { TarjetasService } from '../../../../services/tarjetas/tarjetas';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tdc',
  imports: [Toast, Loading, CommonModule, FormsModule],
  templateUrl: './form-tdc.html',
  styleUrl: './form-tdc.css'
})
export class FormTDC {

  isLoading: boolean = false;
  editar: boolean = false;

  tarjeta: Tarjeta = new Tarjeta();
  tarjetaOriginal: Tarjeta = new Tarjeta();

  valNombre: boolean = false;
  valDescripcion: boolean = false;
  valInstitucion: boolean = false;
  valDpago: boolean = false;
  valDcorte: boolean = false;

  private dataSubscription!: Subscription;
  

  constructor(private toast: ToastService,
    private tarjetaService: TarjetasService,
    private cdr: ChangeDetectorRef
  ) {  }


  ngOnInit() {
  
  
      this.dataSubscription = this.tarjetaService.data$.subscribe(data => {
  
        if (data) {
          
          
          this.isLoading = true;
          this.tarjetaService.getTarjetaById(data).subscribe(response => {
            this.isLoading = false;
  
            if(response.coderr !== "0000"){
              this.toast.show('Error al consultar la tarjeta de crédito', response.message, TypeToast.danger);
              this.cdr.detectChanges();
              return; 
            }
  
            this.tarjeta = Object.assign(new Tarjeta(), response.data);
            this.tarjetaOriginal = Object.assign(new Tarjeta(), response.data);
  
            this.cdr.detectChanges();
  
  
          });

          

        } else {
          this.tarjeta.limpiar();
          this.editar = true;
          this.cdr.detectChanges();
        }


      });
  
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
  
        this.isLoading = true;
  
        this.tarjetaService.updateTarjeta(this.tarjeta.id, {
          nombre: this.tarjeta.nombre,
          descripcion: this.tarjeta.descripcion,
          institucion: this.tarjeta.institucion,
          dpago: this.tarjeta.dpago,
          dcorte: this.tarjeta.dcorte
        }).subscribe(response => {
  
          this.isLoading = false;
  
          if(response.coderr !== "0000"){
            this.toast.show('Error al actualizar la tarjeta de crédito', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return; 
          }
  
          this.toast.show('Tarjeta actualizada exitosamente', "", TypeToast.success);
  
          
  
          if (response.data && response.data.id) {
  
            this.tarjeta = Object.assign(new Tarjeta(), response.data);
            this.tarjetaOriginal = Object.assign(new Tarjeta(), response.data);
            this.tarjetaService.setData(this.tarjeta.id);
  
            this.cdr.detectChanges();
          }
  
        }, error => {
          this.isLoading = false;
          this.toast.show('Error al actualizar la tdc', error.error.message, TypeToast.danger);
        });
  
      } else {
  
        //Nueva TDC
  
        this.isLoading = true;
  
        this.tarjetaService.addTarjeta(this.tarjeta).subscribe(response => {
  
          this.isLoading = false;
  
          if(response.coderr !== "0000"){
            this.toast.show('Error al registrar la tarjeta', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return; 
          }
  
          this.toast.show('Tarejta creada exitosamente', "", TypeToast.success);
  
          
  
          if (response.data && response.data.id) {
  
            this.tarjeta = Object.assign(new Tarjeta(), response.data);
            this.tarjetaOriginal = Object.assign(new Tarjeta(), response.data);
            this.tarjetaService.setData(this.tarjeta.id);
  
            this.cdr.detectChanges();
          }
  
        }, error => {
          this.isLoading = false;
          this.toast.show('Error al crear la tdc', error.error.message, TypeToast.danger);
        });
      }
  
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

    this.isLoading = true;

    this.tarjetaService.activaDesactivaTarjeta(this.tarjeta.id, !this.tarjeta.activa).subscribe(response => {

      this.tarjeta.activa = response.data;
      this.tarjetaOriginal.activa = response.data;

      this.cdr.detectChanges();

      this.toast.show('TDC activada exitosamente', "", TypeToast.success);

      this.isLoading = false;
    } , error => {
      this.isLoading = false;
      this.toast.show('Error al actualizar la TDC', error.error.message, TypeToast.danger);
    });
  }

  cancelaEdicion(): void {
      this.tarjeta = Object.assign(new Tarjeta(), this.tarjetaOriginal);
      this.editar = false;
    }

  ngOnDestroy() {
    this.isLoading = false;
    this.toast.clear();
    this.tarjetaService.setData(null);
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

}
