import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface typToast{
  className?: string;
  title?:string;
  text?:string;
  icon?: string;
  type?: TypeToast;
}

export enum TypeToast{
  success,
  danger
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  private toastsSubject = new BehaviorSubject<typToast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  toasts:typToast[] = [];

  private push(toast: typToast){
    this.toasts.push(toast)
  }

  remove(toast: typToast){
    this.toasts = this.toasts.filter((t)=> t !== toast)
    this.toastsSubject.next([...this.toasts]); // Emite una copia del arreglo
  }

  clear(){
    this.toasts.splice(0,this.toasts.length)
    //this.toasts = []
  }

  show(title: string, text: string, type: TypeToast){

    this.push({type, text, title})
    this.toastsSubject.next([...this.toasts]); // Emite una copia del arreglo
    
  }

}
