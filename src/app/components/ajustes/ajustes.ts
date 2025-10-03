import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../shared/toast/toast';
import { Loading } from '../../shared/loading/loading';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CategoriasService } from '../../services/categorias/categorias';


@Component({
  selector: 'app-ajustes',
  imports: [CommonModule, FormsModule, Toast, Loading, RouterLink, RouterOutlet],
  templateUrl: './ajustes.html',
  styleUrl: './ajustes.css'
})
export class Ajustes {

  isLoading = false;
  mostrarCategoriasModal = false;
  
  constructor(private router: Router, private categoriasService: CategoriasService) { }

  isCategorias(): boolean {
    return this.router.url === '/dashboard/ajustes/categorias';
  }

  abrirCategoriasModal(): void {
    this.categoriasService.setData(null); // Limpia cualquier dato previo
    this.categoriasService.setAbrirCategoriasModal(true); // Indica que se debe abrir el modal
  }

}
