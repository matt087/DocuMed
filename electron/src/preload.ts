import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  cerrarAplicacion: () => ipcRenderer.send("cerrar-aplicacion"),
  confirmarCierreDesdeX: () => ipcRenderer.send("confirmar-cierre-desde-x"),
  onSolicitarConfirmacionCierre: (callback: () => void) => {
    ipcRenderer.on("solicitar-confirmacion-cierre", () => callback());
  },
  seleccionarCarpeta: (): Promise<string | null> => ipcRenderer.invoke("seleccionar-carpeta"),
});