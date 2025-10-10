import { Component } from '@angular/core';
import  { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { ItemMenu } from '../../shared/item-menu/item-menu';
import { Transacciones } from '../transacciones/transacciones';
import { FormsModule } from '@angular/forms';
import { CategoriasService } from '../../services/categorias/categorias';
import { CuentasService } from '../../services/cuentas/cuentas';
import { Subscription } from 'rxjs';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { TransaccionesService } from '../../services/transacciones/transacciones';
import { filter } from 'rxjs/operators';
import { CategoriasModal } from '../ajustes/categorias-modal/categorias-modal';
import { Loading } from '../../shared/loading/loading';
import { GeneralService } from '../../services/general-service';
import { PerfilService } from '../../services/perfil/perfil-service';
import { Perfil } from '../../models/perfil';
import { Transferencias } from '../transferencias/transferencias';
import { TransferenciasService } from '../../services/transferencias/transferencias';


@Component({
  selector: 'app-dashboard',
  imports: [ RouterOutlet, RouterLink, CommonModule, ItemMenu,Transacciones, FormsModule, CategoriasModal, Loading, Transferencias],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  constructor(public authService: Auth, 
    private router: Router, 
    private categoriasService: CategoriasService,
    private cuentasServices: CuentasService,
    private tarjetasService: TarjetasService,
    private transaccionService: TransaccionesService,
    private generalService: GeneralService,
    private perfilService: PerfilService,
    private transferenciaService: TransferenciasService
  ) {}

  perfil: Perfil = new Perfil();

  openPerfil = false;
  mostrarTransaccionesModal: boolean = false;
  mostrarCategoriasModal: boolean = false;
  mostrarTransferenciasModal: boolean = false;
  isLoading: boolean = false; 

  cuentasSuscription: Subscription | null = null;
  tarjetasSuscription: Subscription | null = null;
  categoriasSuscription: Subscription | null = null;
  cargaTransaccionSuscription: Subscription | null = null;
  cargaTransferenciaSuscription: Subscription | null = null;
  categoriasModalSuscription: Subscription | null = null;
  isLoadingSuscription: Subscription | null = null;

  tipoTransaccion: string = '';

  tabActivo: string = 'Dashboard';
  rutaActual: string = '';
  
  ngOnInit() {
    this.categoriasSuscription = this.categoriasService.getCategorias().subscribe();
    this.cuentasSuscription = this.cuentasServices.getCuentas().subscribe();
    this.tarjetasSuscription = this.tarjetasService.getTarjetas().subscribe();

    this.perfilService.getInfoPerfil().subscribe(response => {
      if(response.coderr === '0000'){
        this.perfil = response.data;
      }
    });


    this.cargaTransaccionSuscription = this.transaccionService.transaccion$.subscribe(transaccion => {
      if(transaccion && transaccion.id){
        this.tipoTransaccion = transaccion.tipo;
        this.mostrarTransaccionesModal = true;
        this.menuAbierto = false;
      }
    })

    this.cargaTransferenciaSuscription = this.transferenciaService.transferenciaId$.subscribe(transferencia => {
      if(transferencia && transferencia !== ''){
        this.mostrarTransferenciasModal = true;
        this.menuAbierto = false;
      }
    });

    

    this.categoriasModalSuscription = this.categoriasService.abrirCategoriasModal$.subscribe(abrir => {
      if(abrir) {
        this.mostrarCategoriasModal = true;
      }
    }); 

    this.isLoadingSuscription = this.generalService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });

    /// Determinar la pestaña activa según la ruta actual al cargar el componente
    this.rutaActual = this.router.url;
    if(this.rutaActual.includes('ajustes')) {
      this.tabActivo = 'Ajustes';
    }else if(this.rutaActual.includes('cuentas')) {
      this.tabActivo = 'Cuentas';
    } else {
      this.tabActivo = 'Dashboard';
    }

    /// Escuchar cambios en la ruta para actualizar la pestaña activa
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {

      if(event.urlAfterRedirects.includes('ajustes')) {
        this.tabActivo = 'Ajustes';
      }else if(event.urlAfterRedirects.includes('cuentas')) {
        this.tabActivo = 'Cuentas';
      } else {
        this.tabActivo = 'Dashboard';
      }

    });

  }

  ngOnDestroy() {
    this.cuentasSuscription?.unsubscribe();
    this.tarjetasSuscription?.unsubscribe();
    this.categoriasSuscription?.unsubscribe();
    this.cargaTransaccionSuscription?.unsubscribe();
    this.categoriasModalSuscription?.unsubscribe();
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

  // Acción para "Nuevo Egreso"
  nuevaCategoria(): void {
    this.categoriasService.setAbrirCategoriasModal(true);
    this.menuAbierto = false; // Cierra el menú después de la acción
  }

  nuevaTransferencia(): void {
    this.mostrarTransferenciasModal = true;
    this.menuAbierto = false; // Cierra el menú después de la acción
  }

  cerrarTransaccionesModal() {
    this.mostrarTransaccionesModal = false;
  }

  cerrarTransferenciasModal() {
    this.mostrarTransferenciasModal = false;
  }

  cerrarCategoriasModal() {
    this.mostrarCategoriasModal = false;
  } 

}
