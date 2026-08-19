import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { createRequire } from "module";
import { obtenerCarpetaDatos } from "../config/rutas-datos";

const EmbeddedPostgresModule = require("embedded-postgres");
const EmbeddedPostgres =
  EmbeddedPostgresModule.default || EmbeddedPostgresModule;

const requireEmbeddedPostgres = createRequire(
  require.resolve("embedded-postgres")
);

const PUERTO = Number(process.env.PG_EMBEBIDO_PUERTO);
const USUARIO = process.env.PG_EMBEBIDO_USUARIO;
const PASSWORD = process.env.PG_EMBEBIDO_PASSWORD;
const NOMBRE_BD = process.env.PG_EMBEBIDO_BASE_DATOS;

const CARPETA_DATOS = path.join(
  obtenerCarpetaDatos(),
  "pgdata"
);

let instancia: any = null;

export function obtenerConnectionString(): string {
  return `postgresql://${USUARIO}:${PASSWORD}@localhost:${PUERTO}/${NOMBRE_BD}`;
}

function obtenerRutaPgCtl(): string {
  const rutaModuloWindows = requireEmbeddedPostgres.resolve(
    "@embedded-postgres/windows-x64"
  );

  const rutaPaqueteWindows = path.dirname(
    path.dirname(rutaModuloWindows)
  );

  return path.join(
    rutaPaqueteWindows,
    "native",
    "bin",
    "pg_ctl.exe"
  );
}

async function detenerPostgresConPgCtl(): Promise<void> {
  const pgCtl = obtenerRutaPgCtl();

  console.log("Deteniendo PostgreSQL mediante pg_ctl...");
  console.log(`pg_ctl: ${pgCtl}`);
  console.log(`Directorio de datos: ${CARPETA_DATOS}`);

  await new Promise<void>((resolve, reject) => {
    const proceso = spawn(
      pgCtl,
      [
        "stop",
        "-D",
        CARPETA_DATOS,
        "-m",
        "fast",
      ],
      {
        windowsHide: true,
      }
    );

    let stderr = "";

    proceso.stdout.on("data", (data) => {
      console.log(`[pg_ctl] ${data.toString().trim()}`);
    });

    proceso.stderr.on("data", (data) => {
      const mensaje = data.toString();

      stderr += mensaje;

      console.error(`[pg_ctl] ${mensaje.trim()}`);
    });

    proceso.on("error", (error) => {
      reject(
        new Error(
          `No se pudo ejecutar pg_ctl: ${error.message}`
        )
      );
    });

    proceso.on("close", (codigo) => {
      if (codigo === 0) {
        console.log("PostgreSQL se apagó correctamente.");
        resolve();
      } else {
        reject(
          new Error(
            `pg_ctl terminó con código ${codigo}. ${stderr}`
          )
        );
      }
    });
  });
}

export async function iniciarPostgresEmbebido(): Promise<string> {
  const primeraVez = !fs.existsSync(CARPETA_DATOS);

  instancia = new EmbeddedPostgres({
    databaseDir: CARPETA_DATOS,
    user: USUARIO,
    password: PASSWORD,
    port: PUERTO,
    persistent: true,
  });

  if (primeraVez) {
    console.log(
      "Inicializando cluster de PostgreSQL embebido (primera vez)..."
    );

    await instancia.initialise();
  }

  console.log("Iniciando PostgreSQL embebido...");
  await instancia.start();

  if (primeraVez) {
    console.log(`Creando base de datos "${NOMBRE_BD}"...`);
    await instancia.createDatabase(NOMBRE_BD);
  }

  console.log(
    `PostgreSQL embebido listo en el puerto ${PUERTO}.`
  );

  return obtenerConnectionString();
}

export async function detenerPostgresEmbebido(): Promise<void> {
  if (!instancia) {
    return;
  }

  console.log("Deteniendo PostgreSQL embebido...");

  try {
    if (process.platform === "win32") {
      await detenerPostgresConPgCtl();
    } else {
      await instancia.stop();
    }
  } finally {
    instancia = null;
  }
}