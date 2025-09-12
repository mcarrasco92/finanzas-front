import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../../shared/toast/toast';
import { ToastService, TypeToast } from '../../../../shared/toast/service/toast-service';
import { DataService } from '../service/data-service';
import { Subscription } from 'rxjs';
import { CuentasService } from '../../../../services/cuentas/cuentas';
import { Loading } from '../../../../shared/loading/loading';

@Component({
  selector: 'app-form-debito',
  imports: [CommonModule, FormsModule, Toast, Loading],
  templateUrl: './form-debito.html',
  styleUrl: './form-debito.css'
})
export class FormDebito {

  constructor(private toast: ToastService,
    private dataService: DataService,
    private cuentasService: CuentasService,
    private cdr: ChangeDetectorRef
  ) { }

  isLoading: boolean = false;
  editar: boolean = false;

  inversion: boolean = false;
  valNombre: boolean = false;
  valDescripcion: boolean = false;
  valInstitucion: boolean = false;
  valSaldo: boolean = false;

  idCuenta: string = '';
  nombreCuenta: string = '';
  descripcion: string = '';
  institucion: string = '';
  saldo: string = '';
  vista: boolean = false;
  activa: boolean = false;

  private dataSubscription!: Subscription; // Variable para almacenar la suscripción


  ngOnInit() {



    this.dataSubscription = this.dataService.data$.subscribe(data => {

      if (data) {

        this.isLoading = true;
        this.cuentasService.getCuentaById(data).subscribe(response => {
          this.isLoading = false;

          if(response.coderr !== "0000"){
            this.toast.show('Error al consultar la cuenta', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return; 
          }
          

          this.idCuenta = response.data.id;
          this.nombreCuenta = response.data.nombre;
          this.descripcion = response.data.descripcion;
          this.institucion = response.data.institucion;
          this.saldo =  this.formatearSaldoDirecto(response.data.saldo.toString());
          this.vista = response.data.vista;
          this.inversion = response.data.inversion;
          this.activa = response.data.activa;

          this.cdr.detectChanges();


        });
      } else {
        this.idCuenta = '';
        this.nombreCuenta = '';
        this.descripcion = '';
        this.institucion = '';
        this.saldo = '';
        this.vista = false;
        this.inversion = false;

        this.editar = true;
        this.cdr.detectChanges();
      }
    });

  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  activaDesactivaCuenta(): void {
    if (!this.idCuenta) {
      return;
    }

    this.isLoading = true;

    this.cuentasService.activaDesactivaCuenta(this.idCuenta, !this.activa).subscribe(response => {

      console.log(response);

      this.activa = response.data;

      this.cdr.detectChanges();

      this.toast.show('Cuenta activada exitosamente', "", TypeToast.success);

      this.isLoading = false;
    } , error => {
      this.isLoading = false;
      this.toast.show('Error al actualizar la cuenta', error.error.message, TypeToast.danger);
    });
  }


  enviaDatos(): void {


    this.valNombre = this.nombreCuenta.trim() === '';

    if (this.valNombre) {
      return;
    }

    this.editar = false;

    if (this.idCuenta) {
      //Actualizar cuenta

      this.isLoading = true;

      this.cuentasService.updateCuenta(this.idCuenta, {
        nombre: this.nombreCuenta,
        descripcion: this.descripcion,
        institucion: this.institucion,
        saldo: this.saldo.replace(/,/g, ''),
        vista: this.vista,
        inversion: this.inversion

      }).subscribe(response => {

        console.log(response);
        this.toast.show('Cuenta actualizada exitosamente', "", TypeToast.success);

        this.isLoading = false;

        if (response.data && response.data.id) {

          this.idCuenta = response.data.id;
          this.nombreCuenta = response.data.nombre;
          this.descripcion = response.data.descripcion;
          this.institucion = response.data.institucion;
          this.saldo = response.data.saldo;
          this.vista = response.data.vista;
          this.inversion = response.data.inversion;
          this.activa = response.data.activa;

          this.cdr.detectChanges();
        }

      }, error => {
        this.isLoading = false;
        this.toast.show('Error al actualizar la cuenta', error.error.message, TypeToast.danger);
      });

    } else {

      //Nueva cuenta

      this.isLoading = true;

      this.cuentasService.addCuenta({
        nombre: this.nombreCuenta,
        descripcion: this.descripcion,
        institucion: this.institucion,
        saldo: this.saldo.replace(/,/g, ''),
        vista: this.vista,
        inversion: this.inversion,
        activa: true
      }).subscribe(response => {

        console.log(response);
        this.toast.show('Cuenta creada exitosamente', "", TypeToast.success);

        this.isLoading = false;

        if (response.data && response.data.id) {

          this.idCuenta = response.data.id;
          this.nombreCuenta = response.data.nombre;
          this.descripcion = response.data.descripcion;
          this.institucion = response.data.institucion;
          this.saldo = response.data.saldo;
          this.vista = response.data.vista;
          this.inversion = response.data.inversion;
          this.activa = response.data.activa;

          this.cdr.detectChanges();
        }

      }, error => {
        this.isLoading = false;
        this.toast.show('Error al crear la cuenta', error.error.message, TypeToast.danger);
      });
    }

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
