import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../../core/services/paciente.service';
import { Paciente } from '../../../core/models/paciente.model';

const COLORES_AVATAR = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './paciente-list.html',
  styleUrl: './paciente-list.css',
})
export class PacienteList implements OnInit {
  private pacienteService = inject(PacienteService);

  pacientes = signal<Paciente[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  busqueda = signal('');

  pacientesFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.pacientes();

    return this.pacientes().filter((p) => {
      const nombreCompleto = `${p.nombres} ${p.apellidos}`.toLowerCase();
      const cedula = (p.cedula ?? '').toLowerCase();
      return nombreCompleto.includes(termino) || cedula.includes(termino);
    });
  });

  totalPacientes = computed(() => this.pacientes().length);

  nuevosEsteMes = computed(() => {
    const ahora = new Date();
    return this.pacientes().filter((p) => {
      const creado = new Date(p.created_at);
      return creado.getMonth() === ahora.getMonth() && creado.getFullYear() === ahora.getFullYear();
    }).length;
  });

  edadPromedio = computed(() => {
    const lista = this.pacientes();
    if (lista.length === 0) return 0;

    const sumaEdades = lista.reduce((acc, p) => acc + this.calcularEdad(p.fecha_nacimiento), 0);
    return Math.round(sumaEdades / lista.length);
  });

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.pacienteService.listar().subscribe({
      next: (data) => {
        this.pacientes.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los pacientes. Verifica que el servidor esté corriendo.');
        this.cargando.set(false);
      },
    });
  }

  eliminarPaciente(id_paciente: number, nombreCompleto: string): void {
    const confirmado = confirm(`¿Eliminar al paciente ${nombreCompleto}? Esta acción no se puede deshacer desde la interfaz.`);
    if (!confirmado) return;

    this.pacienteService.eliminar(id_paciente).subscribe({
      next: () => {
        this.pacientes.update((lista) => lista.filter((p) => p.id_paciente !== id_paciente));
      },
      error: () => {
        alert('Ocurrió un error al eliminar el paciente.');
      },
    });
  }

  obtenerIniciales(paciente: Paciente): string {
    const inicialNombre = paciente.nombres.trim().charAt(0).toUpperCase();
    const inicialApellido = paciente.apellidos.trim().charAt(0).toUpperCase();
    return `${inicialNombre}${inicialApellido}`;
  }

  obtenerColorAvatar(id_paciente: number): string {
    return COLORES_AVATAR[id_paciente % COLORES_AVATAR.length];
  }

  private calcularEdad(fechaNacimiento: string): number {
    const nacimiento = new Date(fechaNacimiento);
    const ahora = new Date();

    let edad = ahora.getFullYear() - nacimiento.getFullYear();
    const aunNoCumple =
      ahora.getMonth() < nacimiento.getMonth() ||
      (ahora.getMonth() === nacimiento.getMonth() && ahora.getDate() < nacimiento.getDate());

    if (aunNoCumple) edad--;
    return edad;
  }
}