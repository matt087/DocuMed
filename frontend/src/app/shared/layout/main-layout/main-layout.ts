import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  colapsado = signal(false);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.electronAPI?.onSolicitarConfirmacionCierre(() => {
      const confirmado = confirm('¿Deseas cerrar la aplicación?');
      if (confirmado) {
        window.electronAPI?.confirmarCierreDesdeX();
      }
    });
  }

  alternarColapso(): void {
    this.colapsado.update((valor) => !valor);
  }

  cerrarAplicacion(): void {
    const confirmado = confirm('¿Deseas cerrar la aplicación?');
    if (!confirmado) return;

    if (window.electronAPI) {
      window.electronAPI.cerrarAplicacion();
    } else {
      window.close();
    }
  }
}