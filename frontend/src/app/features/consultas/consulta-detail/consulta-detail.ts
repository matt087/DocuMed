import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConsultaService } from '../../../core/services/consulta.service';
import { IndicacionService } from '../../../core/services/indicacion.service';
import { ExamenService } from '../../../core/services/examen.service';
import { Consulta } from '../../../core/models/consulta.model';

@Component({
    selector: 'app-consulta-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './consulta-detail.html',
    styleUrl: './consulta-detail.css',
})
export class ConsultaDetail implements OnInit {
    private consultaService = inject(ConsultaService);
    private indicacionService = inject(IndicacionService);
    private examenService = inject(ExamenService);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);

    private idConsulta!: number;

    consulta = signal<Consulta | null>(null);
    cargando = signal(true);
    error = signal<string | null>(null);

    origenListado = signal(false);

    mostrarFormIndicacion = signal(false);
    guardandoIndicacion = signal(false);
    errorIndicacion = signal<string | null>(null);
    formIndicacion = this.fb.nonNullable.group({
        indicacion: ['', Validators.required],
    });

    mostrarFormExamen = signal(false);
    guardandoExamen = signal(false);
    errorExamen = signal<string | null>(null);
    archivoSeleccionado = signal<File | null>(null);

    ngOnInit(): void {
        this.idConsulta = Number(this.route.snapshot.paramMap.get('id'));
        this.origenListado.set(this.route.snapshot.queryParamMap.get('origen') === 'listado');
        this.cargarConsulta();
    }

    private cargarConsulta(): void {
        this.cargando.set(true);
        this.consultaService.buscarPorId(this.idConsulta).subscribe({
            next: (data) => {
                this.consulta.set(data);
                this.cargando.set(false);
            },
            error: () => {
                this.error.set('No se pudo cargar la información de la consulta.');
                this.cargando.set(false);
            },
        });
    }

    agregarIndicacion(): void {
        if (this.formIndicacion.invalid) {
            this.formIndicacion.markAllAsTouched();
            return;
        }

        this.guardandoIndicacion.set(true);
        this.errorIndicacion.set(null);

        this.indicacionService.crear(this.idConsulta, this.formIndicacion.getRawValue()).subscribe({
            next: () => {
                this.formIndicacion.reset();
                this.mostrarFormIndicacion.set(false);
                this.guardandoIndicacion.set(false);
                this.cargarConsulta();
            },
            error: () => {
                this.errorIndicacion.set('Ocurrió un error al agregar la indicación.');
                this.guardandoIndicacion.set(false);
            },
        });
    }

    eliminarIndicacion(id_indicacion: number): void {
        const confirmado = confirm('¿Eliminar esta indicación?');
        if (!confirmado) return;

        this.indicacionService.eliminar(id_indicacion).subscribe({
            next: () => this.cargarConsulta(),
            error: () => alert('Ocurrió un error al eliminar la indicación.'),
        });
    }

    onArchivoSeleccionado(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.archivoSeleccionado.set(input.files?.[0] ?? null);
    }

    agregarExamen(): void {
        if (!this.archivoSeleccionado()) {
            this.errorExamen.set('Debes seleccionar un archivo.');
            return;
        }

        this.guardandoExamen.set(true);
        this.errorExamen.set(null);

        this.examenService.crear(this.idConsulta, this.archivoSeleccionado()!).subscribe({
            next: () => {
                this.archivoSeleccionado.set(null);
                this.mostrarFormExamen.set(false);
                this.guardandoExamen.set(false);
                this.cargarConsulta();
            },
            error: () => {
                this.errorExamen.set('Ocurrió un error al agregar el examen.');
                this.guardandoExamen.set(false);
            },
        });
    }

    eliminarExamen(id_examen: number): void {
        const confirmado = confirm('¿Eliminar este examen?');
        if (!confirmado) return;

        this.examenService.eliminar(id_examen).subscribe({
            next: () => this.cargarConsulta(),
            error: () => alert('Ocurrió un error al eliminar el examen.'),
        });
    }

    nombreArchivo(rutaCompleta: string): string {
        return rutaCompleta.split(/[\\/]/).pop() ?? rutaCompleta;
    }

    abrirExamen(id_examen: number): void {
        window.open(this.examenService.obtenerUrlArchivo(id_examen), '_blank');
    }
}