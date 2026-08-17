import { Injectable, signal, effect } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'documed-tema';

  tema = signal<Tema>(this.leerTemaGuardado());

  constructor() {
    effect(() => {
      const tema = this.tema();
      document.documentElement.classList.toggle('dark', tema === 'oscuro');
      localStorage.setItem(this.STORAGE_KEY, tema);
    });
  }

  private leerTemaGuardado(): Tema {
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