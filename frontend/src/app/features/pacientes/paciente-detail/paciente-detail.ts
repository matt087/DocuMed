import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente.service';
import { Paciente } from '../../../core/models/paciente.model';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './paciente-detail.html',
  styleUrl: './paciente-detail.css',
})
export class PacienteDetail implements OnInit {
  private pacienteService = inject(PacienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  paciente = signal<Paciente | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  edad = computed(() => {
    const p = this.paciente();
    if (!p) return null;
    return this.calcularEdad(p.fecha_nacimiento);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPaciente(id);
  }

  private cargarPaciente(id: number): void {
    this.cargando.set(true);

    this.pacienteService.buscarPorId(id).subscribe({
      next: (data) => {
        this.paciente.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del paciente.');
        this.cargando.set(false);
      },
    });
  }

  eliminarPaciente(): void {
    const p = this.paciente();
    if (!p) return;

    const confirmado = confirm(`¿Eliminar al paciente ${p.nombres} ${p.apellidos}? Esta acción no se puede deshacer desde la interfaz.`);
    if (!confirmado) return;

    this.pacienteService.eliminar(p.id_paciente).subscribe({
      next: () => this.router.navigate(['/pacientes']),
      error: () => alert('Ocurrió un error al eliminar el paciente.'),
    });
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