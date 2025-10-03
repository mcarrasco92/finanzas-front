import { Component } from '@angular/core';
import  { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { ItemMenu } from '../../shared/item-menu/item-menu';
import { Transacciones } from '../transacciones/transacciones';
import { FormsModule } from '@angular/forms';
import { CategoriasService } from '../../services/categorias/categorias';
import { Categoria } from '../../models/categoria';
import { CuentasService } from '../../services/cuentas/cuentas';
import { Subscription } from 'rxjs';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { TransaccionesService } from '../../services/transacciones/transacciones';

@Component({
  selector: 'app-dashboard',
  imports: [ RouterOutlet, RouterLink, CommonModule, ItemMenu,Transacciones, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  constructor(public authService: Auth, 
    private router: Router, 
    private categoriasService: CategoriasService,
    private cuentasServices: CuentasService,
    private tarjetasService: TarjetasService,
    private transaccionService: TransaccionesService
  ) {}

  openPerfil = false;
  mostrarTransaccionesModal: boolean = false;

  cuentasSuscription: Subscription | null = null;
  tarjetasSuscription: Subscription | null = null;
  categoriasSuscription: Subscription | null = null;
  cargaTransaccionSuscription: Subscription | null = null;

  tipoTransaccion: string = '';
  
  ngOnInit() {
    this.categoriasSuscription = this.categoriasService.getCategorias().subscribe();
    this.cuentasSuscription = this.cuentasServices.getCuentas().subscribe();
    this.tarjetasSuscription = this.tarjetasService.getTarjetas().subscribe();
    this.cargaTransaccionSuscription = this.transaccionService.transaccion$.subscribe(transaccion => {
      if(transaccion && transaccion.id){
        this.tipoTransaccion = transaccion.tipo;
        this.mostrarTransaccionesModal = true;
        this.menuAbierto = false;
      }
    })
  }

  ngOnDestroy() {
    this.cuentasSuscription?.unsubscribe();
    this.tarjetasSuscription?.unsubscribe();
    this.categoriasSuscription?.unsubscribe();
    this.cargaTransaccionSuscription?.unsubscribe();
  }

  togglePerfil() {
    this.openPerfil = !this.openPerfil;
  }

  cerrarSesion() {
    this.openPerfil = false;

    this.authService.cerrarSesion();

    this.router.navigate(['/login']);
  }

  menuAbierto: boolean = false; // Controla si el menú está abierto o cerrado

  // Alterna el estado del menú
  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  // Acción para "Nuevo Ingreso"
  nuevoIngreso(): void {
    this.tipoTransaccion = 'Ingreso';
    this.mostrarTransaccionesModal = true;
    this.menuAbierto = false;
  }

  // Acción para "Nuevo Egreso"
  nuevoEgreso(): void {
    this.tipoTransaccion = 'Egreso';
    this.mostrarTransaccionesModal = true;
    this.menuAbierto = false; // Cierra el menú después de la acción
  }

  cerrarTransaccionesModal() {
    this.mostrarTransaccionesModal = false;
  }

}
