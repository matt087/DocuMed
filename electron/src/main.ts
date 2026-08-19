import { config } from "dotenv";
import path from "path";
import { app, BrowserWindow, ipcMain, dialog} from "electron";
import { spawn, ChildProcess } from "child_process";
import { esperarBackend } from "./esperar-backend";

app.setName("DocuMed");

config({ path: path.join(__dirname, "..", ".env") });

function obtenerVariableRequerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Verifica tu archivo .env.`);
  }
  return valor;
}

const BACKEND_URL_HEALTHCHECK = obtenerVariableRequerida("BACKEND_URL_HEALTHCHECK");
const FRONTEND_URL_DEV = obtenerVariableRequerida("FRONTEND_URL_DEV");

let procesoBackend: ChildProcess | null = null;
let ventanaPrincipal: BrowserWindow | null = null;
let cierreConfirmado = false;

function iniciarProcesoBackend(): ChildProcess {
  const rutaBackend = path.join(__dirname, "..", "..", "backend");
  const rutaEntryBackend = path.join(rutaBackend, "src", "app.ts");
  const rutaDatosUsuario = app.getPath("userData");

  const proceso = spawn(
    process.execPath,
    ["--import", "tsx", rutaEntryBackend],
    {
      cwd: rutaBackend,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        DOCUMED_DATOS_DIR: rutaDatosUsuario, // NUEVO
      },
    }
  );

  proceso.stdout?.on("data", (data) => console.log(`[backend] ${data.toString().trim()}`));
  proceso.stderr?.on("data", (data) => console.error(`[backend] ${data.toString().trim()}`));

  proceso.on("exit", (codigo) => {
    console.log(`El proceso del backend terminó con código ${codigo}`);
  });

  proceso.on("error", (error) => {
    console.error("Error al spawnear el proceso del backend:", error);
  });

  return proceso;
}

async function crearVentana(): Promise<void> {
  ventanaPrincipal = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // TO-DO: distinguir dev/producción y cargar el build de Angular en ese caso.
  await ventanaPrincipal.loadURL(FRONTEND_URL_DEV);

  ventanaPrincipal.on("close", (evento) => {
    if (cierreConfirmado) {
      return;
    }
    evento.preventDefault();
    ventanaPrincipal?.webContents.send("solicitar-confirmacion-cierre");
  });

  ventanaPrincipal.on("closed", () => {
    ventanaPrincipal = null;
  });
}

ipcMain.on("cerrar-aplicacion", () => {
  cierreConfirmado = true;
  app.quit();
});

ipcMain.on("confirmar-cierre-desde-x", () => {
  cierreConfirmado = true;
  ventanaPrincipal?.close();
});

app.whenReady().then(async () => {
  try {
    console.log("Iniciando proceso del backend...");
    procesoBackend = iniciarProcesoBackend();

    console.log("Esperando a que el backend esté listo...");
    await esperarBackend(BACKEND_URL_HEALTHCHECK);
    console.log("Backend listo. Abriendo ventana...");

    await crearVentana();
  } catch (error) {
    console.error("Error fatal al iniciar la aplicación:", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (procesoBackend) {
    console.log("Cerrando proceso del backend...");
    procesoBackend.kill();
  }
});

ipcMain.handle("seleccionar-carpeta", async () => {
  if (!ventanaPrincipal) return null;

  const resultado = await dialog.showOpenDialog(ventanaPrincipal, {
    properties: ["openDirectory", "createDirectory"],
    title: "Selecciona la carpeta para almacenar los exámenes",
  });

  if (resultado.canceled || resultado.filePaths.length === 0) {
    return null;
  }

  const carpetaElegida = resultado.filePaths[0];
  return path.join(carpetaElegida, "DocuMed", "examenes");
});