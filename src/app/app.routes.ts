import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Dashboard } from './components/dashboard/dashboard';
import { Cuentas } from './components/cuentas/cuentas';

export const routes: Routes = [
  {path: 'registro', component: Registro}, // Ruta para el componente de registro
  {path: 'dashboard', component: Dashboard, children: [
    {path: 'cuentas', component: Cuentas}
  ]}, // Ruta para el componente de dashboard
  {path: '', component: Login}, // Ruta por defecto que carga el componente de login 
  { path: '**', redirectTo: '' } // Redirige cualquier ruta no encontrada al login
];