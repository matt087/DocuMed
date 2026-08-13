import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente.service';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.css',
})
export class PacienteForm implements OnInit {
  private fb = inject(FormBuilder);
  private pacienteService = inject(PacienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  editando = signal(false);
  private idPaciente: number | null = null;

  cargando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    sexo: ['' as 'M' | 'F' | '', Validators.required],
    cedula: [''],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    fecha_primera_consulta: ['', Validators.required],
    lugar_nacimiento: ['', Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.idPaciente = Number(idParam);
      this.editando.set(true);
      this.cargarPaciente(this.idPaciente);
    } else {
      this.form.patchValue({ fecha_primera_consulta: this.obtenerFechaHoy() });
      this.form.get('fecha_primera_consulta')?.disable();
    }
  }

  private obtenerFechaHoy(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private cargarPaciente(id: number): void {
    this.cargando.set(true);

    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        this.form.patchValue({
          nombres: paciente.nombres,
          apellidos: paciente.apellidos,
          fecha_nacimiento: this.aFechaInput(paciente.fecha_nacimiento),
          sexo: paciente.sexo,
          cedula: paciente.cedula ?? '',
          direccion: paciente.direccion,
          telefono: paciente.telefono,
          fecha_primera_consulta: this.aFechaInput(paciente.fecha_primera_consulta),
          lugar_nacimiento: paciente.lugar_nacimiento,
        });
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del paciente.');
        this.cargando.set(false);
      },
    });
  }

  private aFechaInput(fechaIso: string): string {
    return fechaIso.slice(0, 10);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.form.getRawValue();
    const payload = {
      ...valores,
      sexo: valores.sexo as 'M' | 'F',
      cedula: valores.cedula.trim() === '' ? undefined : valores.cedula,
    };

    const peticion = this.editando()
      ? this.pacienteService.actualizar(this.idPaciente!, payload)
      : this.pacienteService.crear(payload);

    peticion.subscribe({
      next: () => {
        this.router.navigate(['/pacientes']);
      },
      error: () => {
        this.error.set('Ocurrió un error al guardar el paciente. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }

  campoInvalido(nombreCampo: string): boolean {
    const campo = this.form.get(nombreCampo);
    return !!campo && campo.invalid && campo.touched;
  }
}