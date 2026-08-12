import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { PacienteList } from './features/pacientes/paciente-list/paciente-list';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      { path: 'pacientes', component: PacienteList },
    ],
  },
];