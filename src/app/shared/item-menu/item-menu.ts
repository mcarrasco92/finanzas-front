import { Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-item-menu',
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './item-menu.html',
  styleUrl: './item-menu.css'
})
export class ItemMenu {

@Input() nombre: string = ''; // Recibe el nombre como parámetro
@Input() link: string = ''; // Recibe el link como parámetro

}
