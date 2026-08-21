import { config } from "dotenv";
import path from "path";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { spawn, ChildProcess } from "child_process";
import { esperarBackend } from "./esperar-backend";
import fs from "fs";

app.setName("DocuMed");

config({ path: path.join(__dirname, "..", ".env") });
const rutaLog = path.join(app.getPath("userData"), "main-error.log");

function escribirLog(linea: string): void {
  const mensaje = `[${new Date().toISOString()}] ${linea}\n`;
  console.log(mensaje);
  try {
    fs.appendFileSync(rutaLog, mensaje);
  } catch {
  }
}

function registrarError(contexto: string, error: unknown): void {
  escribirLog(`ERROR ${contexto}: ${error instanceof Error ? error.stack : String(error)}`);
}

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
  const rutaDatosUsuario = app.getPath("userData");

  let rutaBackend: string;
  let argumentosNode: string[];

  if (app.isPackaged) {
    rutaBackend = path.join(
      process.resourcesPath,
      "backend"
    );

    const rutaEntryBackend = path.join(
      rutaBackend,
      "dist",
      "app.js"
    );

    argumentosNode = [
      rutaEntryBackend
    ];
  } else {
    rutaBackend = path.join(
      __dirname,
      "..",
      "..",
      "backend"
    );

    const rutaEntryBackend = path.join(
      rutaBackend,
      "src",
      "app.ts"
    );

    argumentosNode = [
      "--import",
      "tsx",
      rutaEntryBackend
    ];
  }

  escribirLog(`Iniciando backend desde: ${rutaBackend}`);

  const proceso = spawn(
    process.execPath,
    argumentosNode,
    {
      cwd: rutaBackend,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        DOCUMED_DATOS_DIR: rutaDatosUsuario,
        NODE_PATH: path.join(rutaBackend, "deps-nativas"),
      },
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  proceso.stdout?.on("data", (data) =>
    escribirLog(`[backend] ${data.toString().trim()}`)
  );

  proceso.stderr?.on("data", (data) =>
    escribirLog(`[backend] ${data.toString().trim()}`)
  );

  proceso.on("exit", (codigo) => {
    escribirLog(
      `El proceso del backend terminó con código ${codigo}`
    );
  });

  proceso.on("error", (error) => {
    registrarError(
      "Error al spawnear el proceso del backend",
      error
    );
  });

  return proceso;
}

async function crearVentana(): Promise<void> {
  ventanaPrincipal = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: "#1d293d",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  let indexPath: string;

  if (app.isPackaged) {
    console.log("Modo producción: cargando Angular compilado...");
    const rutaFrontend = path.join(process.resourcesPath, "frontend", "browser");
    indexPath = path.join(rutaFrontend, "index.csr.html");
  } else {
    console.log("Modo desarrollo: cargando Angular compilado localmente...");
    const rutaFrontend = path.join(__dirname, "..", "..", "frontend", "dist", "frontend", "browser");
    indexPath = path.join(rutaFrontend, "index.csr.html");
  }

  ventanaPrincipal.webContents.on("did-fail-load", (_evento, codigoError, descripcion, urlFallida) => {
    console.error(`Falló la carga de: ${urlFallida} (${codigoError} - ${descripcion})`);
    console.log("Recuperando: recargando la aplicación desde el estado inicial...");
    ventanaPrincipal?.loadFile(indexPath, { hash: "/" });
  });

  await ventanaPrincipal.loadFile(indexPath, { hash: "/" });

  ventanaPrincipal.on("close", (evento) => {
    if (cierreConfirmado) return;
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
    escribirLog("Iniciando proceso del backend...");
    procesoBackend = iniciarProcesoBackend();

    escribirLog("Esperando a que el backend esté listo...");
    await esperarBackend(BACKEND_URL_HEALTHCHECK, procesoBackend);
    escribirLog("Backend listo. Abriendo ventana...");

    await crearVentana();
  } catch (error) {
    registrarError("Error fatal al iniciar la aplicación", error);
    dialog.showErrorBox(
      "Error al iniciar DocuMed",
      `${error instanceof Error ? error.message : String(error)}\n\nRevisá el registro completo en:\n${rutaLog}`
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

let cierreBackendCompletado = false;

app.on("before-quit", (evento) => {
  if (cierreBackendCompletado) {
    return;
  }

  evento.preventDefault();

  if (!procesoBackend || procesoBackend.exitCode !== null) {
    cierreBackendCompletado = true;
    app.quit();
    return;
  }

  console.log("Solicitando cierre limpio del backend...");

  procesoBackend.stdin?.write("shutdown\n");

  procesoBackend.once("exit", () => {
    console.log("Backend cerrado correctamente.");

    cierreBackendCompletado = true;
    app.quit();
  });
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