import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment, app } from '../environment/environment';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { log } from 'console';


@Injectable({
  providedIn: 'root'
})
export class Auth {

  baseUrl = environment.apiUrl; // Usa la URL del entorno
  auth = getAuth(app);

  constructor(private http: HttpClient) { }

  registrarUsuario(datos: any): Observable<any> {
    return this.http.post(this.baseUrl + '/api/users/register', datos); // Envía los datos al backend
  }

  loginUsuario(datos: any): Observable<any> {
    return from(
      signInWithEmailAndPassword(this.auth, datos.email, datos.password)
        .then(async (userCredential) => {
          // Usuario autenticado
          const user = userCredential.user;
  
          // Obtén el ID Token de Firebase
          const firebaseToken = await user.getIdToken();
  
          // Envía el token de Firebase al backend
          return this.http.post<{ coderr: string; message: string; data: string }>(this.baseUrl + '/api/users/validate-token', { firebaseToken })
            .toPromise()
            .then((response) => {

              if (!response) {
                throw new Error('La respuesta del backend es undefined');
              }

              if (response.coderr === '0000') {
                // Guarda el token JWT en localStorage
                const jwtToken = response.data;
                localStorage.setItem('jwtToken', jwtToken); // O usa sessionStorage si prefieres
  
                return {
                  coderr: response.coderr,
                  message: response.message,
                };
              } else {
                return {
                  coderr: response.coderr,
                  message: 'Error al validar el token en el backend.',
                };
              }
            });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(errorCode, errorMessage);
  
          return {
            coderr: "1001",
            message: "Error al ingresar, verifique sus credenciales",
          };
        })
    );
  }


  loginGoogle(): Observable<any> {

    return from(signInWithPopup(this.auth, new GoogleAuthProvider()).then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log(user)


      // Obtén el ID Token de Firebase
      const firebaseToken = await user.getIdToken();
  
      // Envía el token de Firebase al backend
      return this.http.post<{ coderr: string; message: string; data: string }>(this.baseUrl + '/api/users/validate-token', { firebaseToken })
        .toPromise()
        .then((response) => {

          if (!response) {
            throw new Error('La respuesta del backend es undefined');
          }

          if (response.coderr === '0000') {
            // Guarda el token JWT en localStorage
            const jwtToken = response.data;
            localStorage.setItem('jwtToken', jwtToken); // O usa sessionStorage si prefieres

            return {
              coderr: response.coderr,
              message: response.message,
            };
          } else {
            return {
              coderr: response.coderr,
              message: 'Error al validar el token en el backend.',
            };
          }
        });



      const resp = {
        coderr: "0000",
        message: "Ingreso exitoso"
      }
      return resp
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(errorCode, errorMessage, email, credential)
      const resp = {
        coderr: "1001",
        message: "Error al ingresar con Google" + errorMessage
      }
      return resp

    }));
  }

  isEmailProvider(): boolean {
    return this.auth.currentUser?.providerData.some(p => p.providerId === 'password') ?? false;
  }

  cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Observable<any> {
    return from(
      (async () => {
        const user = this.auth.currentUser;
        if (!user || !user.email) throw new Error('No hay usuario autenticado');
        const credential = EmailAuthProvider.credential(user.email, contrasenaActual);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, contrasenaNueva);
        return { coderr: '0000', message: 'Contraseña actualizada correctamente' };
      })().catch(error => {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          return { coderr: '1001', message: 'La contraseña actual es incorrecta' };
        }
        return { coderr: '1001', message: 'No se pudo actualizar la contraseña' };
      })
    );
  }

  async recuperarContrasena(email: string): Promise<{ coderr: string; message: string }> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { coderr: '0000', message: 'Correo enviado' };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return { coderr: '1001', message: 'No existe una cuenta con ese correo.' };
      }
      return { coderr: '9999', message: 'Error al enviar el correo de recuperación.' };
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('jwtToken'); // O usa sessionStorage si prefieres
    return !!token; // Devuelve true si el token existe, false si no
  }

  cerrarSesion() {
    localStorage.removeItem('jwtToken'); // O usa sessionStorage si prefieres
    this.auth.signOut().then(() => {
      console.log('Usuario desconectado de Firebase');
    }).catch((error) => {
      console.error('Error al desconectar el usuario de Firebase:', error);
    });
  }

};


