import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  private router = inject(Router);

  pestanaActiva = signal<Pestana>('apariencia');

  infoAlmacenamiento = signal<InfoAlmacenamiento | null>(null);
  cargandoAlmacenamiento = signal(true);
  nuevaRuta = signal('');
  cambiandoRuta = signal(false);
  errorAlmacenamiento = signal<string | null>(null);
  exitoAlmacenamiento = signal<string | null>(null);

  generandoRespaldo = signal(false);
  errorRespaldo = signal<string | null>(null);

  archivoRestaurar = signal<File | null>(null);
  restaurando = signal(false);
  errorRestaurar = signal<string | null>(null);
  exitoRestaurar = signal<string | null>(null);

  arrastrandoArchivo = signal(false);

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

  generarRespaldo(): void {
    this.generandoRespaldo.set(true);
    this.errorRespaldo.set(null);

    this.configuracionService.generarRespaldo().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DocuMed_respaldo_${new Date().toISOString().slice(0, 10)}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.generandoRespaldo.set(false);
      },
      error: () => {
        this.errorRespaldo.set('Ocurrió un error al generar el respaldo. Verifica que pg_dump esté disponible.');
        this.generandoRespaldo.set(false);
      },
    });
  }

  seleccionarCarpetaNativa(): void {
    if (!window.electronAPI) return;

    window.electronAPI.seleccionarCarpeta().then((rutaElegida) => {
      if (rutaElegida) {
        this.nuevaRuta.set(rutaElegida);
      }
    });
  }

  seleccionarArchivoRestaurar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoRestaurar.set(input.files?.[0] ?? null);
    this.errorRestaurar.set(null);
    this.exitoRestaurar.set(null);
  }

   limpiarArchivoRestaurar(): void {
    this.archivoRestaurar.set(null);
    this.errorRestaurar.set(null);
    this.exitoRestaurar.set(null);
  }

  confirmarRestaurar(): void {
    const archivo = this.archivoRestaurar();
    if (!archivo) return;

    const confirmado = confirm(
      'Esta acción reemplazará TODOS los datos actuales (pacientes, consultas, exámenes) ' +
      'con los del respaldo seleccionado. Esta acción no se puede deshacer. ¿Continuar?'
    );
    if (!confirmado) return;

    this.restaurando.set(true);
    this.errorRestaurar.set(null);
    this.exitoRestaurar.set(null);

    this.configuracionService.restaurarRespaldo(archivo).subscribe({
      next: () => {
        this.exitoRestaurar.set('Restauración completada.');
        this.restaurando.set(false);
        this.router.navigateByUrl('/', { skipLocationChange: false }).then(() => {
        });
      },
      error: (err) => {
        this.errorRestaurar.set(err?.error?.error ?? 'Ocurrió un error al restaurar el respaldo.');
        this.restaurando.set(false);
      },
    });
  }

    onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrandoArchivo.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrandoArchivo.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrandoArchivo.set(false);

    const archivo = event.dataTransfer?.files?.[0];
    if (!archivo) return;

    if (!archivo.name.toLowerCase().endsWith('.zip')) {
      this.errorRestaurar.set('El archivo debe ser un .zip');
      return;
    }

    this.archivoRestaurar.set(archivo);
    this.errorRestaurar.set(null);
    this.exitoRestaurar.set(null);
  }
}