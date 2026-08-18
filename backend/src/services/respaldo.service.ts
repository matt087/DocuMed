import { spawn } from "child_process";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
const archiver = require("archiver");
import { obtenerRutaExamenes } from "../config/app-config";

interface DatosConexion {
  host: string;
  puerto: string;
  usuario: string;
  password: string;
  baseDatos: string;
}

function parsearDatabaseUrl(url: string): DatosConexion {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    puerto: parsed.port || "5432",
    usuario: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    baseDatos: parsed.pathname.replace("/", ""),
  };
}

function ejecutarPgDump(datos: DatosConexion, rutaSalida: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-h", datos.host,
      "-p", datos.puerto,
      "-U", datos.usuario,
      "-d", datos.baseDatos,
      "-f", rutaSalida,
      "--no-password",
    ];

    const proceso = spawn("pg_dump", args, {
      env: { ...process.env, PGPASSWORD: datos.password },
    });

    let stderr = "";
    proceso.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proceso.on("close", (codigo) => {
      if (codigo === 0) {
        resolve();
      } else {
        reject(new Error(`pg_dump falló (código ${codigo}): ${stderr}`));
      }
    });

    proceso.on("error", (error) => {
      reject(new Error(`No se pudo ejecutar pg_dump. ¿Está instalado y en el PATH? Detalle: ${error.message}`));
    });
  });
}

function comprimirEnZip(archivos: { rutaOrigen: string; nombreEnZip: string }[], carpetas: { rutaOrigen: string; nombreEnZip: string }[], rutaZipSalida: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(rutaZipSalida);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (error: Error) => reject(error));

    archive.pipe(output);

    for (const archivo of archivos) {
      archive.file(archivo.rutaOrigen, { name: archivo.nombreEnZip });
    }

    for (const carpeta of carpetas) {
      if (fs.existsSync(carpeta.rutaOrigen)) {
        archive.directory(carpeta.rutaOrigen, carpeta.nombreEnZip);
      }
    }

    archive.finalize();
  });
}

export const respaldoService = {
  async generar(): Promise<{ rutaZip: string; nombreArchivo: string }> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("No se encontró DATABASE_URL en las variables de entorno.");
    }

    const datosConexion = parsearDatabaseUrl(databaseUrl);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const carpetaTemp = path.join(process.cwd(), "temp", `respaldo_${timestamp}`);
    await fsPromises.mkdir(carpetaTemp, { recursive: true });

    const rutaSqlTemp = path.join(carpetaTemp, "base_de_datos.sql");

    try {
      await ejecutarPgDump(datosConexion, rutaSqlTemp);

      const rutaExamenes = obtenerRutaExamenes();
      const nombreZip = `DocuMed_respaldo_${timestamp}.zip`;
      const carpetaSalida = path.join(process.cwd(), "respaldos");
      await fsPromises.mkdir(carpetaSalida, { recursive: true });
      const rutaZipFinal = path.join(carpetaSalida, nombreZip);

      await comprimirEnZip(
        [{ rutaOrigen: rutaSqlTemp, nombreEnZip: "base_de_datos.sql" }],
        [{ rutaOrigen: rutaExamenes, nombreEnZip: "examenes" }],
        rutaZipFinal
      );

      return { rutaZip: rutaZipFinal, nombreArchivo: nombreZip };
    } finally {
      await fsPromises.rm(carpetaTemp, { recursive: true, force: true });
    }
  },
};