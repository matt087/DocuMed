import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsultaService } from '../../../core/services/consulta.service';
import { CrearConsultaInput } from '../../../core/models/consulta.model';

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './consulta-form.html',
  styleUrl: './consulta-form.css',
})
export class ConsultaForm implements OnInit {
  private fb = inject(FormBuilder);
  private consultaService = inject(ConsultaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  idPaciente!: number;

  guardando = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    fecha: ['', Validators.required],

    peso: ['', [Validators.required, Validators.min(0)]],
    talla: ['', [Validators.required, Validators.min(0)]],
    presion_sistolica: ['', [Validators.required, Validators.min(0)]],
    presion_diastolica: ['', [Validators.required, Validators.min(0)]],
    temperatura: ['', [Validators.required, Validators.min(0)]],
    perimetro_cefalico: ['', Validators.min(0)], // opcional

    motivo_consulta: ['', Validators.required],
    enfermedad_actual: ['', Validators.required],
    examen_fisico: ['', Validators.required],
    diagnostico: ['', Validators.required],
  });

  ngOnInit(): void {
    this.idPaciente = Number(this.route.snapshot.paramMap.get('id'));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const payload: CrearConsultaInput = {
      fecha: v.fecha,
      peso: Number(v.peso),
      talla: Number(v.talla),
      presion_sistolica: Number(v.presion_sistolica),
      presion_diastolica: Number(v.presion_diastolica),
      temperatura: Number(v.temperatura),
      perimetro_cefalico: v.perimetro_cefalico.trim() === '' ? null : Number(v.perimetro_cefalico),
      motivo_consulta: v.motivo_consulta,
      enfermedad_actual: v.enfermedad_actual,
      examen_fisico: v.examen_fisico,
      diagnostico: v.diagnostico,
    };

    this.consultaService.crear(this.idPaciente, payload).subscribe({
      next: (nuevaConsulta) => {
        this.router.navigate(['/consultas', nuevaConsulta.id_consulta]);
      },
      error: () => {
        this.error.set('Ocurrió un error al guardar la consulta. Verifica los datos e intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }

  campoInvalido(nombreCampo: string): boolean {
    const campo = this.form.get(nombreCampo);
    return !!campo && campo.invalid && campo.touched;
  }
}