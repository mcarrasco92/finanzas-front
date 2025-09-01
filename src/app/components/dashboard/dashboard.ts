import { Component } from '@angular/core';
import  { RouterOutlet, RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  imports: [ RouterOutlet, RouterLink, NgbDropdownModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

}
