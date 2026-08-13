import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente.service';
import { ContactoService } from '../../../core/services/contacto.service';
import { AntecedenteService } from '../../../core/services/antecedente.service';
import { Paciente } from '../../../core/models/paciente.model';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './paciente-detail.html',
  styleUrl: './paciente-detail.css',
})
export class PacienteDetail implements OnInit {
  private pacienteService = inject(PacienteService);
  private contactoService = inject(ContactoService);
  private antecedenteService = inject(AntecedenteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  private idPaciente!: number;

  paciente = signal<Paciente | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  edad = computed(() => {
    const p = this.paciente();
    if (!p) return null;
    return this.calcularEdad(p.fecha_nacimiento);
  });

  mostrarFormContacto = signal(false);
  guardandoContacto = signal(false);
  errorContacto = signal<string | null>(null);
  formContacto = this.fb.nonNullable.group({
    nombres: ['', Validators.required],
    relacion: ['', Validators.required],
    telefono: ['', Validators.required],
  });

  mostrarFormAntecedente = signal(false);
  guardandoAntecedente = signal(false);
  errorAntecedente = signal<string | null>(null);
  formAntecedente = this.fb.nonNullable.group({
    tipo: ['' as 'Personal' | 'Familiar' | 'GO' | '', Validators.required],
    descripcion: ['', Validators.required],
  });

  ngOnInit(): void {
    this.idPaciente = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPaciente();
  }

  private cargarPaciente(): void {
    this.cargando.set(true);

    this.pacienteService.buscarPorId(this.idPaciente).subscribe({
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

  agregarContacto(): void {
    if (this.formContacto.invalid) {
      this.formContacto.markAllAsTouched();
      return;
    }

    this.guardandoContacto.set(true);
    this.errorContacto.set(null);

    this.contactoService.crear(this.idPaciente, this.formContacto.getRawValue()).subscribe({
      next: () => {
        this.formContacto.reset();
        this.mostrarFormContacto.set(false);
        this.guardandoContacto.set(false);
        this.cargarPaciente();
      },
      error: () => {
        this.errorContacto.set('Ocurrió un error al agregar el contacto.');
        this.guardandoContacto.set(false);
      },
    });
  }

  eliminarContacto(id_contacto: number): void {
    const confirmado = confirm('¿Eliminar este contacto?');
    if (!confirmado) return;

    this.contactoService.eliminar(id_contacto).subscribe({
      next: () => this.cargarPaciente(),
      error: () => alert('Ocurrió un error al eliminar el contacto.'),
    });
  }

  agregarAntecedente(): void {
    if (this.formAntecedente.invalid) {
      this.formAntecedente.markAllAsTouched();
      return;
    }

    this.guardandoAntecedente.set(true);
    this.errorAntecedente.set(null);

    const valores = this.formAntecedente.getRawValue();
    this.antecedenteService
      .crear(this.idPaciente, { ...valores, tipo: valores.tipo as 'Personal' | 'Familiar' | 'GO' })
      .subscribe({
        next: () => {
          this.formAntecedente.reset();
          this.mostrarFormAntecedente.set(false);
          this.guardandoAntecedente.set(false);
          this.cargarPaciente();
        },
        error: () => {
          this.errorAntecedente.set('Ocurrió un error al agregar el antecedente.');
          this.guardandoAntecedente.set(false);
        },
      });
  }

  eliminarAntecedente(id_antecedentes: number): void {
    const confirmado = confirm('¿Eliminar este antecedente?');
    if (!confirmado) return;

    this.antecedenteService.eliminar(id_antecedentes).subscribe({
      next: () => this.cargarPaciente(),
      error: () => alert('Ocurrió un error al eliminar el antecedente.'),
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