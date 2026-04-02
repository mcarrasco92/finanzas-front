import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpaceService } from '../../services/space/space.service';
import { Space } from '../../models/space';

@Component({
  selector: 'app-select-space',
  imports: [CommonModule],
  templateUrl: './select-space.html'
})
export class SelectSpace {

  spaces: Space[] = [];
  cargando = true;

  constructor(
    private spaceService: SpaceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Intenta usar los espacios que vienen del estado de navegación (post-login)
    const fromState: Space[] = history.state['spaces'];
    if (fromState?.length) {
      this.spaces = fromState;
      this.cargando = false;
      this.cdr.detectChanges();
    } else {
      // Fallback: carga directamente del servicio (ej. recarga de página)
      this.spaceService.getSpaces().subscribe(response => {
        this.cargando = false;
        if (response.coderr === '0000') {
          const spaces: Space[] = response.data;
          if (spaces.length === 0) {
            this.router.navigate(['/create-space']);
            return;
          }
          this.spaces = spaces;
        }
        this.cdr.detectChanges();
      });
    }
  }

  seleccionar(space: Space): void {
    this.spaceService.setActiveSpace(space);
    this.router.navigate(['/dashboard/home']);
  }
}
