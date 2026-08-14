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

  ngOnInit(): void {
    this.cargarConsultas();
  }

  cargarConsultas(): void {
    this.cargando.set(true);
    this.error.set(null);

    const desde = this.fechaDesde().trim() || undefined;
    const hasta = this.fechaHasta().trim() || undefined;

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