import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { PacienteList } from './features/pacientes/paciente-list/paciente-list';
import { PacienteForm } from './features/pacientes/paciente-form/paciente-form';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      { path: 'pacientes', component: PacienteList },
      { path: 'pacientes/nuevo', component: PacienteForm },
      { path: 'pacientes/:id/editar', component: PacienteForm },
    ],
  },
];