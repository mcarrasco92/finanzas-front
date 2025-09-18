import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../shared/toast/toast';
import { Loading } from '../../shared/loading/loading';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CategoriasModal } from './categorias-modal/categorias-modal';


@Component({
  selector: 'app-ajustes',
  imports: [CommonModule, FormsModule, Toast, Loading, RouterLink, RouterOutlet, CategoriasModal],
  templateUrl: './ajustes.html',
  styleUrl: './ajustes.css'
})
export class Ajustes {

  isLoading = false;
mostrarCategoriasModal = false;
  
  constructor(private router: Router) { }

  isCategorias(): boolean {
    return this.router.url === '/dashboard/ajustes/categorias';
  }

  abrirCategoriasModal(): void {
    this.mostrarCategoriasModal = true; // Muestra el modal
  }

  cerrarCategoriasModal(): void {
    this.mostrarCategoriasModal = false; // Oculta el modal
  }

}
