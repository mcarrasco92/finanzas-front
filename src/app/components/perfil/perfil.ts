import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Toast } from '../../shared/toast/toast';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, Toast],
  templateUrl: './perfil.html'
})
export class Perfil {}
