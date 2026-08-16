import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { PacienteList } from './features/pacientes/paciente-list/paciente-list';
import { PacienteForm } from './features/pacientes/paciente-form/paciente-form';
import { PacienteDetail } from './features/pacientes/paciente-detail/paciente-detail';
import { ConsultaList } from './features/consultas/consulta-list/consulta-list';
import { ConsultaForm } from './features/consultas/consulta-form/consulta-form';
import { ConsultaDetail } from './features/consultas/consulta-detail/consulta-detail';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      { path: 'pacientes', component: PacienteList },
      { path: 'pacientes/nuevo', component: PacienteForm },
      { path: 'pacientes/:id/editar', component: PacienteForm },
      { path: 'pacientes/:id', component: PacienteDetail },
      { path: 'consultas', component: ConsultaList },
      { path: 'pacientes/:id/consultas/nueva', component: ConsultaForm },
      { path: 'consultas/:id', component: ConsultaDetail },
    ],
  },
];