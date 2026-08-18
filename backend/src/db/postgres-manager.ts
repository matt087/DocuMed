import path from "path";
import fs from "fs";

const EmbeddedPostgresModule = require("embedded-postgres");
const EmbeddedPostgres = EmbeddedPostgresModule.default || EmbeddedPostgresModule;

console.log('DEBUG:', typeof EmbeddedPostgres);

const PUERTO = Number(process.env.PG_EMBEBIDO_PUERTO);
const USUARIO = process.env.PG_EMBEBIDO_USUARIO;
const PASSWORD = process.env.PG_EMBEBIDO_PASSWORD;
const NOMBRE_BD = process.env.PG_EMBEBIDO_BASE_DATOS;

const CARPETA_DATOS = path.join(process.cwd(), "pgdata");

let instancia: any = null;

export function obtenerConnectionString(): string {
  return `postgresql://${USUARIO}:${PASSWORD}@localhost:${PUERTO}/${NOMBRE_BD}`;
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
    console.log("Inicializando cluster de PostgreSQL embebido (primera vez)...");
    await instancia.initialise();
  }

  console.log("Iniciando PostgreSQL embebido...");
  await instancia.start();

  if (primeraVez) {
    console.log(`Creando base de datos "${NOMBRE_BD}"...`);
    await instancia.createDatabase(NOMBRE_BD);
  }

  console.log(`PostgreSQL embebido listo en el puerto ${PUERTO}.`);
  return obtenerConnectionString();
}

export async function detenerPostgresEmbebido(): Promise<void> {
  if (instancia) {
    console.log("Deteniendo PostgreSQL embebido...");
    await instancia.stop();
    instancia = null;
  }
}