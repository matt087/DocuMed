export {};

declare global {
  interface Window {
    electronAPI?: {
      cerrarAplicacion: () => void;
      confirmarCierreDesdeX: () => void;
      onSolicitarConfirmacionCierre: (callback: () => void) => void;
      seleccionarCarpeta: () => Promise<string | null>;
    };
  }
}