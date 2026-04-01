import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../shared/toast/toast';
import { Loading } from '../../shared/loading/loading';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CategoriasService } from '../../services/categorias/categorias';
import { GeneralService } from '../../services/general-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ajustes',
  imports: [CommonModule, FormsModule, Toast, Loading, RouterLink, RouterOutlet],
  templateUrl: './ajustes.html',
  styleUrl: './ajustes.css'
})
export class Ajustes {

  mostrarCatDesactivadas: boolean = false;
  private desactivadasSubscription!: Subscription;

  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private generalService: GeneralService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.desactivadasSubscription = this.generalService.mostrarCategoriasDesactivadas$.subscribe(value => {
      this.mostrarCatDesactivadas = value;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.desactivadasSubscription?.unsubscribe();
  }

  onToggleCatDesactivadas(): void {
    this.generalService.setMostrarCategoriasDesactivadas(this.mostrarCatDesactivadas);
  }

  isCategorias(): boolean {
    return this.router.url === '/dashboard/ajustes/categorias';
  }

  abrirCategoriasModal(): void {
    this.categoriasService.setData(null);
    this.categoriasService.setAbrirCategoriasModal(true);
  }
}
