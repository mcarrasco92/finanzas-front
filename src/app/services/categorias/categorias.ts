import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  baseUrl = environment.apiUrl; // Usa la URL del entorno
  constructor(private http: HttpClient) { }

  ordenaCategorias(datos: any): Observable<any> {
    return this.http.post(this.baseUrl + '/api/categorias/orden', datos).pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));
  }

  //Consultar categorias
  getCategorias(): Observable<any> {

      
   
      return this.http.get(this.baseUrl + '/api/categorias').pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));
    
  }

  //Agregar categoria
  addCategoria(categoria: any): Observable<any> {

    console.log(categoria);

    return this.http.post(this.baseUrl + '/api/categorias/registrar', categoria).pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  

    // Lógica para agregar una nueva categoria
  }

  //Actualizar categoria
  updateCategoria(categoriaId: string, categoria: any): Observable<any> {
    return this.http.put(this.baseUrl + `/api/categorias/actualizar/${categoriaId}`, categoria).pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  
    // Lógica para actualizar una categoria existente
  }

 

  getCategoriaById(categoriaId: string): Observable<any> {
    return this.http.get(this.baseUrl + `/api/categorias/${categoriaId}`).pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  

  }


  activaDesactivaCategoria(categoriaId: string, activa: boolean): Observable<any> {
    return this.http.put(this.baseUrl + `/api/categorias/activar/${categoriaId}`, activa).pipe(
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  
  }


   //Eliminar categoria
   deleteCategoria(categoriaId: string) {
    // Lógica para eliminar una categoria
  }



  private idCategoria = new BehaviorSubject<any>(null);
    data$ = this.idCategoria.asObservable();
  
    setData(data: any) {
      this.idCategoria.next(data);
    }

  private recargaCategorias = new BehaviorSubject<boolean>(false);
  recarga$ = this.recargaCategorias.asObservable();

  setRecarga(value: boolean) {
    this.recargaCategorias.next(value);
  }
}
