import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Toast } from '../../shared/toast/toast';


@Component({
  selector: 'app-registro',
  imports: [RouterLink, CommonModule, FormsModule, Toast],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  mostrarEtiqueta: boolean = false;
  password: string = ''; // Almacena la contraseña
  confirmPassword: string = ''; // Almacena la confirmación de la contraseña
  email: string = ''; // Almacena el email
  name: string = ''; // Almacena el nombre
  birthdate: string = ''; // Almacena la fecha de nacimiento

  valName: boolean = false;
  valEmail: boolean = false;
  valPassword: boolean = false;
  valConfirmPassword: boolean = false;
  valBirthdate: boolean = false;

  lenPassword: boolean = false;

  constructor(private authService: Auth,
    private toastService: ToastService
  ) { }


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
    if(!this.birthdate || this.birthdate.trim() === '') { this.valBirthdate = true } else { this.valBirthdate = false; }

    if(this.valName || this.valEmail || this.valPassword || this.valBirthdate, this.valConfirmPassword) {
      return false;
    }

    if (this.password.length < 8) {
      this.lenPassword = true;
      return false;
    } else {
      this.lenPassword = false;
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
      password: this.password,
      birthdate: this.birthdate

    };

    this.authService.registrarUsuario(datos).subscribe(
      response => {
        console.log(response)

        if(response.coderr === "0000"){
          this.toastService.show("Operación exitosa",response.message, TypeToast.success);
        }else{
          this.toastService.show("Error",response.message, TypeToast.danger);
        }
      },
      error => {
        this.toastService.show("Error","Error al registrar el usuario", TypeToast.danger);
      }


    );
  }
}
