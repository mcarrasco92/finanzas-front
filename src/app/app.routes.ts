import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Dashboard } from './components/dashboard/dashboard';
import { Cuentas } from './components/cuentas/cuentas';
import { authGuard } from './guards/auth-guard';
import { spaceGuard } from './guards/space-guard';
import { SelectSpace } from './components/select-space/select-space';
import { ListaDebito } from './components/cuentas/debito/lista-debito/lista-debito';
import { FormDebito } from './components/cuentas/debito/form-debito/form-debito';
import { ListaTDC } from './components/cuentas/tdc/lista-tdc/lista-tdc';
import { FormTDC } from './components/cuentas/tdc/form-tdc/form-tdc';
import { Categorias } from './components/categorias/categorias';
import { Msi } from './components/msi/msi';
import { TransaccionesRecurrentes } from './components/transacciones-recurrentes/transacciones-recurrentes';
import { Home } from './components/home/home';
import { Movimientos } from './components/movimientos/movimientos';
import { CreateSpace } from './components/create-space/create-space';
import { Perfil } from './components/perfil/perfil';
import { Espacios } from './components/perfil/espacios/espacios';
import { CambiarContrasena } from './components/perfil/cambiar-contrasena/cambiar-contrasena';
import { RecuperarContrasena } from './components/recuperar-contrasena/recuperar-contrasena';

export const routes: Routes = [
  {path: 'registro', component: Registro},
  {path: 'recuperar-contrasena', component: RecuperarContrasena},
  {path: 'select-space', component: SelectSpace, canActivate: [authGuard]},
  {path: 'create-space', component: CreateSpace, canActivate: [authGuard]},
  {path: 'dashboard', component: Dashboard, canActivate: [authGuard, spaceGuard], children: [
    {path: 'cuentas', component: Cuentas, children: [
      {path: 'debito', component: ListaDebito},
      {path: 'debitof', component: FormDebito},
      {path: 'debitof/:id', component: FormDebito},
      {path: 'tdc', component: ListaTDC},
      {path: 'tdcf', component: FormTDC},
      {path: 'tdcf/:id', component: FormTDC},
    ]},
    {path: 'msi', component: Msi},
    {path: 'categorias', component: Categorias},
    {path: 'transacciones-recurrentes', component: TransaccionesRecurrentes},
    {path: 'movimientos', component: Movimientos},
    {path: 'home', component: Home},
    {path: 'perfil', component: Perfil, children: [
      {path: 'espacios', component: Espacios},
      {path: 'cambiar-contrasena', component: CambiarContrasena},
      {path: '', redirectTo: 'espacios', pathMatch: 'full'}
    ]}
  ]}, // Ruta para el componente de dashboard
  {path: '', component: Login}, // Ruta por defecto que carga el componente de login 
  { path: '**', redirectTo: '' } // Redirige cualquier ruta no encontrada al login
];