import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import {catchError,  Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  baseUrl = environment.apiUrl; // Usa la URL del entorno

  constructor(private http: HttpClient) { }

  getInfoPerfil(): Observable<any> {
    return this.http.get(this.baseUrl + '/api/perfil').pipe(
      catchError((error) => {
        throw error;
      }));
  }

  
  
}
