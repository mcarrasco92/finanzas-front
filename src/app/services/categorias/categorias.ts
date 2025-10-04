import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { BehaviorSubject } from 'rxjs';
import { Categoria } from '../../models/categoria';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { GeneralService } from '../general-service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  baseUrl = environment.apiUrl; // Usa la URL del entorno

  private getCategoriasSubscription: Subscription | null = null;

  constructor(private http: HttpClient,
              private generalService: GeneralService
  ) { }

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
      tap((response: any) => {
        
        if (response.coderr === '0000') {
          const ingresos:Categoria[] = response.data.categoriasIngresos;
          const egresos:Categoria[] = response.data.categoriasEgresos;
          ingresos.sort((a, b) => a.orden - b.orden);
          egresos.sort((a, b) => a.orden - b.orden);
          this.setCategoriasIngresos(ingresos);
          this.setCategoriasEgresos(egresos);
        }
      }),
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));
    
  }

  //Agregar categoria
  addCategoria(categoria: any): Observable<any> {

    this.generalService.setIsLoading(true);
    return this.http.post(this.baseUrl + '/api/categorias/registrar', categoria).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
        this.getCategoriasSubscription?.unsubscribe();
        this.getCategoriasSubscription = this.getCategorias().subscribe();
      }),
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  

    // Lógica para agregar una nueva categoria
  }

  //Actualizar categoria
  updateCategoria(categoriaId: string, categoria: any): Observable<any> {
    this.generalService.setIsLoading(true);
    return this.http.put(this.baseUrl + `/api/categorias/actualizar/${categoriaId}`, categoria).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
        this.getCategoriasSubscription?.unsubscribe();
        this.getCategoriasSubscription = this.getCategorias().subscribe();
      }),
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  
    // Lógica para actualizar una categoria existente
  }

 
  
  getCategoriaById(categoriaId: string): Observable<any> {
    this.generalService.setIsLoading(true);
    return this.http.get(this.baseUrl + `/api/categorias/${categoriaId}`).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
      }),
      catchError((error) => {
        // Manejo del error
        throw error; // Re-lanzar el error para que pueda ser manejado por el suscriptor
      }));  

  }


  activaDesactivaCategoria(categoriaId: string, activa: boolean): Observable<any> {
    this.generalService.setIsLoading(true);
    return this.http.put(this.baseUrl + `/api/categorias/activar/${categoriaId}`, activa).pipe(
      tap(() => {
        this.generalService.setIsLoading(false);
        this.getCategoriasSubscription?.unsubscribe();
        this.getCategoriasSubscription = this.getCategorias().subscribe();
      }),
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
/*
  private recargaCategorias = new BehaviorSubject<boolean>(false);
  recarga$ = this.recargaCategorias.asObservable();

  setRecarga(value: boolean) {
    this.recargaCategorias.next(value);
  }
*/



  private categoriasIngresos = new BehaviorSubject<Categoria[]>([]);
  private categoriasEgresos = new BehaviorSubject<Categoria[]>([]);
  private abrirCategoriasModal = new BehaviorSubject<boolean>(false);

  categoriasIngresos$ = this.categoriasIngresos.asObservable();
  categoriasEgresos$ = this.categoriasEgresos.asObservable();
  abrirCategoriasModal$ = this.abrirCategoriasModal.asObservable();


  setCategoriasIngresos(categorias: Categoria[]) {
    this.categoriasIngresos.next(categorias);
  }

  setCategoriasEgresos(categorias: Categoria[]) {
    this.categoriasEgresos.next(categorias);
  } 

  setAbrirCategoriasModal(abrir: boolean) {
    this.abrirCategoriasModal.next(abrir);
  }


}
