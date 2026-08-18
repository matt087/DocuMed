import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Tema = 'claro' | 'oscuro';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'documed-tema';
  private platformId = inject(PLATFORM_ID);
  private esNavegador = isPlatformBrowser(this.platformId);

  tema = signal<Tema>(this.leerTemaGuardado());

  constructor() {
    effect(() => {
      const tema = this.tema();
      if (!this.esNavegador) return;

      document.documentElement.classList.toggle('dark', tema === 'oscuro');
      localStorage.setItem(this.STORAGE_KEY, tema);
    });
  }

  private leerTemaGuardado(): Tema {
    if (!this.esNavegador) return 'claro';

    const guardado = localStorage.getItem(this.STORAGE_KEY);
    return guardado === 'oscuro' ? 'oscuro' : 'claro';
  }

  alternar(): void {
    this.tema.set(this.tema() === 'claro' ? 'oscuro' : 'claro');
  }

  establecer(tema: Tema): void {
    this.tema.set(tema);
  }
}