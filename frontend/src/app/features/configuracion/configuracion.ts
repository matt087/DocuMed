import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { ConfiguracionService, InfoAlmacenamiento } from '../../core/services/configuracion.service';

type Pestana = 'apariencia' | 'almacenamiento' | 'respaldo';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion implements OnInit {
  themeService = inject(ThemeService);
  private configuracionService = inject(ConfiguracionService);

  pestanaActiva = signal<Pestana>('apariencia');

  infoAlmacenamiento = signal<InfoAlmacenamiento | null>(null);
  cargandoAlmacenamiento = signal(true);
  nuevaRuta = signal('');
  cambiandoRuta = signal(false);
  errorAlmacenamiento = signal<string | null>(null);
  exitoAlmacenamiento = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarAlmacenamiento();
  }

  seleccionarPestana(pestana: Pestana): void {
    this.pestanaActiva.set(pestana);
  }

  private cargarAlmacenamiento(): void {
    this.cargandoAlmacenamiento.set(true);
    this.configuracionService.obtenerAlmacenamiento().subscribe({
      next: (data) => {
        this.infoAlmacenamiento.set(data);
        this.cargandoAlmacenamiento.set(false);
      },
      error: () => {
        this.errorAlmacenamiento.set('No se pudo cargar la información de almacenamiento.');
        this.cargandoAlmacenamiento.set(false);
      },
    });
  }

  formatearBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  cambiarUbicacion(): void {
    const ruta = this.nuevaRuta().trim();
    if (!ruta) return;

    const confirmado = confirm(
      `Esto copiará ${this.infoAlmacenamiento()?.cantidadArchivos ?? 0} archivo(s) a la nueva ubicación, verificará la copia, actualizará la base de datos y luego eliminará los archivos originales. ¿Deseas continuar?`
    );
    if (!confirmado) return;

    this.cambiandoRuta.set(true);
    this.errorAlmacenamiento.set(null);
    this.exitoAlmacenamiento.set(null);

    this.configuracionService.cambiarAlmacenamiento(ruta).subscribe({
      next: (resultado) => {
        this.exitoAlmacenamiento.set(`Se movieron ${resultado.archivosMovidos} archivo(s) correctamente.`);
        this.nuevaRuta.set('');
        this.cambiandoRuta.set(false);
        this.cargarAlmacenamiento();
      },
      error: (err) => {
        this.errorAlmacenamiento.set(err?.error?.error ?? 'Ocurrió un error al cambiar la ubicación.');
        this.cambiandoRuta.set(false);
      },
    });
  }
}