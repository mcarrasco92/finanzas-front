import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SpaceService } from '../services/space/space.service';

export const spaceGuard: CanActivateFn = () => {
  const spaceService = inject(SpaceService);
  const router = inject(Router);

  if (spaceService.activeSpaceId()) {
    return true;
  } else {
    router.navigate(['/select-space']);
    return false;
  }
};
