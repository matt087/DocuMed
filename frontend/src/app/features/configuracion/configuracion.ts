import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

type Pestana = 'apariencia' | 'almacenamiento' | 'respaldo';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion {
  themeService = inject(ThemeService);

  pestanaActiva = signal<Pestana>('apariencia');

  seleccionarPestana(pestana: Pestana): void {
    this.pestanaActiva.set(pestana);
  }
}