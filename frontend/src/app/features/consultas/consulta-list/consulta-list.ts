import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConsultaService } from '../../../core/services/consulta.service';
import { Consulta } from '../../../core/models/consulta.model';

@Component({
  selector: 'app-consulta-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consulta-list.html',
  styleUrl: './consulta-list.css',
})
export class ConsultaList implements OnInit {
  private consultaService = inject(ConsultaService);

  consultas = signal<Consulta[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  fechaDesde = signal('');
  fechaHasta = signal('');
  errorRango = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarConsultas();
  }

  cargarConsultas(): void {
    const desde = this.fechaDesde().trim() || undefined;
    const hasta = this.fechaHasta().trim() || undefined;

    if (desde && hasta && desde > hasta) {
      this.errorRango.set('La fecha "Desde" no puede ser posterior a la fecha "Hasta".');
      return;
    }
    this.errorRango.set(null);

    this.cargando.set(true);
    this.error.set(null);

    this.consultaService.listar(desde, hasta).subscribe({
      next: (data) => {
        this.consultas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las consultas. Verifica que el servidor esté corriendo.');
        this.cargando.set(false);
      },
    });
  }

  hayFiltroActivo(): boolean {
    return !!this.fechaDesde() || !!this.fechaHasta();
  }

  limpiarFiltro(): void {
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.cargarConsultas();
  }
}