import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Dashboard } from './components/dashboard/dashboard';
import { Cuentas } from './components/cuentas/cuentas';
import { authGuard } from './guards/auth-guard';
import { ListaDebito } from './components/cuentas/debito/lista-debito/lista-debito';
import { FormDebito } from './components/cuentas/debito/form-debito/form-debito';
import { ListaTDC } from './components/cuentas/tdc/lista-tdc/lista-tdc';
import { FormTDC } from './components/cuentas/tdc/form-tdc/form-tdc';
import { Categorias } from './components/ajustes/categorias/categorias';
import { Ajustes } from './components/ajustes/ajustes';
import { Msi } from './components/msi/msi';
import { TransaccionesRecurrentes } from './components/transacciones-recurrentes/transacciones-recurrentes';

export const routes: Routes = [
  {path: 'registro', component: Registro}, // Ruta para el componente de registro
  {path: 'dashboard', component: Dashboard, canActivate:[authGuard], children: [
    {path: 'cuentas', component: Cuentas, children: [
      {path: 'debito', component: ListaDebito},
      {path: 'debitof', component: FormDebito},
      {path: 'debitof/:id', component: FormDebito},
      {path: 'tdc', component: ListaTDC},
      {path: 'tdcf', component: FormTDC},
      {path: 'tdcf/:id', component: FormTDC},
    ]},
    {path: 'msi', component: Msi},
    {path: 'ajustes', component: Ajustes, children: [
      {path: 'categorias', component: Categorias}
    ] },
    {path: 'transacciones-recurrentes', component: TransaccionesRecurrentes}
  ]}, // Ruta para el componente de dashboard
  {path: '', component: Login}, // Ruta por defecto que carga el componente de login 
  { path: '**', redirectTo: '' } // Redirige cualquier ruta no encontrada al login
];