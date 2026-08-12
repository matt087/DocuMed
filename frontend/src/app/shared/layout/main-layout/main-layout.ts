import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  colapsado = signal(false);

  alternarColapso(): void {
    this.colapsado.update((valor) => !valor);
  }

  cerrarAplicacion(): void {
    // TODO: cuando se integre Electron, reemplazar por la llamada IPC real
    // para cerrar la ventana nativa en lugar de depender del comportamiento del navegador.
    const confirmado = confirm('¿Deseas cerrar la aplicación?');
    if (confirmado) {
      window.close();
    }
  }
}