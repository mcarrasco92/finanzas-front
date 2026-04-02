import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpaceService } from '../services/space/space.service';

@Injectable()
export class SpaceInterceptor implements HttpInterceptor {

  constructor(private spaceService: SpaceService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const spaceId = this.spaceService.activeSpaceId();
    if (spaceId) {
      req = req.clone({ setHeaders: { 'X-Space-Id': spaceId } });
    }
    return next.handle(req);
  }
}
