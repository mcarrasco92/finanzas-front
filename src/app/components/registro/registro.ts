import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Toast } from '../../shared/toast/toast';
import { Router } from '@angular/router';
import { Loading } from '../../shared/loading/loading';


@Component({
  selector: 'app-registro',
  imports: [RouterLink, CommonModule, FormsModule, Toast, Loading],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  mostrarEtiqueta: boolean = false;
  password: string = ''; // Almacena la contraseña
  confirmPassword: string = ''; // Almacena la confirmación de la contraseña
  email: string = ''; // Almacena el email
  name: string = ''; // Almacena el nombre

  valName: boolean = false;
  valEmail: boolean = false;
  valEmailChar: boolean = false;
  valPassword: boolean = false;
  valConfirmPassword: boolean = false;

  lenPassword: boolean = false;


  constructor(private authService: Auth,
    private toastService: ToastService,
    private router: Router
  ) { }

  validaCaracteres(event: Event): void {
    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ´\s]/g, '');
    this.name = input.value;
  }

  validaCorreo(): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(this.email.trim() === ''){
      this.valEmailChar = false; // Oculta el mensaje de error si el campo está vacío
      return;
    } 

    // Verifica si el correo es válido
    if (!emailRegex.test(this.email)) {
      this.valEmailChar = true; // Muestra el mensaje de error
    } else {
      this.valEmailChar = false; // Oculta el mensaje de error
    }
  } 


  verificarContrasenas(): void {
    if (this.password && this.confirmPassword) {
      this.mostrarEtiqueta = this.password !== this.confirmPassword;
    } else {
      this.mostrarEtiqueta = false; // Si alguna de las contraseñas está vacía, no mostrar la etiqueta
    }
  }


  validaFormulario():boolean{
    if(!this.name || this.name.trim() === '') { this.valName = true } else { this.valName = false; }
    if(!this.email || this.email.trim() === '') { this.valEmail = true} else { this.valEmail = false; }
    if(!this.password || this.password.trim() === '') { this.valPassword = true } else { this.valPassword = false; }
    if(!this.confirmPassword || this.confirmPassword.trim() === '') { this.valConfirmPassword = true } else { this.valConfirmPassword = false; }

    if(this.valName || this.valEmail || this.valPassword || this.valConfirmPassword) {
      return false;
    }

    if (this.password.length < 8) {
      this.lenPassword = true;
      return false;
    } else {
      this.lenPassword = false;
    }

    if(this.valEmailChar){
      return false;
    }

    return true;

  }

  enviarDatos(): void {

    if(!this.validaFormulario()){
      return;
    }

    const datos = {
      email: this.email,
      name: this.name,
      password: this.password

    };


    this.authService.registrarUsuario(datos).subscribe(
      response => {

        if(response.coderr === "0000"){
          this.toastService.show("Operación exitosa",response.message, TypeToast.success);
          this.router.navigate(['/login']);
        }else{
          this.toastService.show("No se pudo realizar el registro",response.message, TypeToast.danger);
        }
      },
      error => {
        this.toastService.show("No se pudo realizar el registro","Error al registrar el usuario", TypeToast.danger);
      }


    );
  }
}
