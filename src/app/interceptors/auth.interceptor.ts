import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtén el token (puedes obtenerlo de un servicio o almacenamiento local)
    const token = localStorage.getItem('jwtToken'); // Ejemplo: token almacenado en localStorage

    // Clona la solicitud y agrega el encabezado de autorización si el token existe
    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : req;


    // Continúa con la solicitud
    return next.handle(authReq);
  }
}