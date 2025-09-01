import { Component } from '@angular/core';
import  { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { ItemMenu } from '../../shared/item-menu/item-menu';

@Component({
  selector: 'app-dashboard',
  imports: [ RouterOutlet, RouterLink, CommonModule, ItemMenu],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  constructor(public authService: Auth, private router: Router) {}

  openPerfil = false;

  togglePerfil() {
    this.openPerfil = !this.openPerfil;
  }

  cerrarSesion() {
    this.openPerfil = false;

    this.authService.cerrarSesion();

    this.router.navigate(['/login']);
  }

}
