import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
const archiver = require("archiver");
import AdmZip from "adm-zip";
import { Client } from "pg";
import { obtenerRutaExamenes } from "../config/app-config";
import { obtenerCarpetaDatos } from "../config/rutas-datos";
import { obtenerPrisma } from "../db/prisma";

// ===== GENERAR =====

function escaparValor(valor: unknown): string {
  if (valor === null || valor === undefined) return "NULL";
  if (valor instanceof Date) return `'${valor.toISOString()}'`;
  if (typeof valor === "number") return valor.toString();
  if (typeof valor === "boolean") return valor ? "TRUE" : "FALSE";
  if (typeof valor === "object" && typeof (valor as { toString: () => string }).toString === "function") {
    const texto = valor.toString();
    if (/^-?\d+(\.\d+)?$/.test(texto)) return texto;
  }
  return `'${String(valor).replace(/'/g, "''")}'`;
}

function generarInsertsTabla(nombreTabla: string, filas: Record<string, unknown>[]): string {
  if (filas.length === 0) return "";
  const columnas = Object.keys(filas[0]);
  const lineas = filas.map((fila) => {
    const valores = columnas.map((col) => escaparValor(fila[col])).join(", ");
    return `INSERT INTO ${nombreTabla} (${columnas.join(", ")}) VALUES (${valores});`;
  });
  return lineas.join("\n") + "\n";
}

function generarResetSecuencia(nombreTabla: string, columnaId: string, filas: Record<string, unknown>[]): string {
  if (filas.length === 0) return "";
  const maxId = Math.max(...filas.map((f) => Number(f[columnaId])));
  return `SELECT setval(pg_get_serial_sequence('${nombreTabla}', '${columnaId}'), ${maxId}, true);\n`;
}

async function obtenerTodasLasTablas() {
  const prisma = obtenerPrisma();
  return {
    pacientes: await prisma.paciente.findMany({ orderBy: { id_paciente: "asc" } }),
    contactos: await prisma.contacto.findMany({ orderBy: { id_contacto: "asc" } }),
    antecedentes: await prisma.antecedente.findMany({ orderBy: { id_antecedentes: "asc" } }),
    consultas: await prisma.consulta.findMany({ orderBy: { id_consulta: "asc" } }),
    indicaciones: await prisma.indicacion.findMany({ orderBy: { id_indicacion: "asc" } }),
    examenes: await prisma.examen.findMany({ orderBy: { id_examen: "asc" } }),
  };
}

async function generarDumpSQL(): Promise<string> {
  const t = await obtenerTodasLasTablas();

  return [
    `-- Respaldo DocuMed — generado ${new Date().toISOString()}`,
    "BEGIN;",
    "",
    generarInsertsTabla("pacientes", t.pacientes),
    generarInsertsTabla("contactos", t.contactos),
    generarInsertsTabla("antecedentes", t.antecedentes),
    generarInsertsTabla("consultas", t.consultas),
    generarInsertsTabla("indicaciones", t.indicaciones),
    generarInsertsTabla("examenes", t.examenes),
    generarResetSecuencia("pacientes", "id_paciente", t.pacientes),
    generarResetSecuencia("contactos", "id_contacto", t.contactos),
    generarResetSecuencia("antecedentes", "id_antecedentes", t.antecedentes),
    generarResetSecuencia("consultas", "id_consulta", t.consultas),
    generarResetSecuencia("indicaciones", "id_indicacion", t.indicaciones),
    generarResetSecuencia("examenes", "id_examen", t.examenes),
    "COMMIT;",
  ].join("\n");
}

function comprimirEnZip(
  archivos: { rutaOrigen: string; nombreEnZip: string }[],
  carpetas: { rutaOrigen: string; nombreEnZip: string }[],
  rutaZipSalida: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(rutaZipSalida);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (error: Error) => reject(error));

    archive.pipe(output);
    for (const archivo of archivos) archive.file(archivo.rutaOrigen, { name: archivo.nombreEnZip });
    for (const carpeta of carpetas) {
      if (fs.existsSync(carpeta.rutaOrigen)) archive.directory(carpeta.rutaOrigen, carpeta.nombreEnZip);
    }
    archive.finalize();
  });
}

async function ejecutarSQLMultiSentencia(sql: string): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("No se encontró DATABASE_URL en las variables de entorno.");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function obtenerListaArchivosConTamano(dir: string): Promise<Map<string, number>> {
  const resultado = new Map<string, number>();

  async function recorrer(carpetaActual: string, prefijoRelativo: string) {
    const entradas = await fsPromises.readdir(carpetaActual, { withFileTypes: true });
    for (const entrada of entradas) {
      const rutaCompleta = path.join(carpetaActual, entrada.name);
      const rutaRelativa = path.join(prefijoRelativo, entrada.name);
      if (entrada.isDirectory()) {
        await recorrer(rutaCompleta, rutaRelativa);
      } else {
        const stats = await fsPromises.stat(rutaCompleta);
        resultado.set(rutaRelativa, stats.size);
      }
    }
  }

  if (fs.existsSync(dir)) {
    await recorrer(dir, "");
  }
  return resultado;
}

async function verificarCopiaCompleta(origen: string, destino: string): Promise<boolean> {
  const archivosOrigen = await obtenerListaArchivosConTamano(origen);
  const archivosDestino = await obtenerListaArchivosConTamano(destino);

  if (archivosOrigen.size !== archivosDestino.size) return false;

  for (const [rutaRelativa, tamanoOrigen] of archivosOrigen) {
    const tamanoDestino = archivosDestino.get(rutaRelativa);
    if (tamanoDestino === undefined || tamanoDestino !== tamanoOrigen) return false;
  }

  return true;
}

export const respaldoService = {
  async generar(): Promise<{ rutaZip: string; nombreArchivo: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const carpetaTemp = path.join(obtenerCarpetaDatos(), "temp", `respaldo_${timestamp}`);
    await fsPromises.mkdir(carpetaTemp, { recursive: true });

    const rutaSqlTemp = path.join(carpetaTemp, "base_de_datos.sql");

    try {
      const sql = await generarDumpSQL();
      await fsPromises.writeFile(rutaSqlTemp, sql, "utf-8");

      const rutaExamenes = obtenerRutaExamenes();
      const nombreZip = `DocuMed_respaldo_${timestamp}.zip`;
      const carpetaSalida = path.join(obtenerCarpetaDatos(), "respaldos");
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

  async restaurar(rutaZip: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const carpetaTemp = path.join(obtenerCarpetaDatos(), "temp", `restauracion_${timestamp}`);
    await fsPromises.mkdir(carpetaTemp, { recursive: true });

    try {
      const zip = new AdmZip(rutaZip);
      zip.extractAllTo(carpetaTemp, true);

      const rutaSqlExtraido = path.join(carpetaTemp, "base_de_datos.sql");
      if (!fs.existsSync(rutaSqlExtraido)) {
        throw new Error("El archivo de respaldo no contiene 'base_de_datos.sql'. ¿Es un respaldo válido de DocuMed?");
      }
      const sql = await fsPromises.readFile(rutaSqlExtraido, "utf-8");

      const limpiarTablas = `TRUNCATE TABLE pacientes, contactos, antecedentes, consultas, indicaciones, examenes RESTART IDENTITY CASCADE;`;

      if (!sql.includes("BEGIN;")) {
        throw new Error("El archivo de respaldo no tiene el formato esperado (falta 'BEGIN;'). ¿Es un respaldo válido de DocuMed?");
      }
      const sqlConLimpieza = sql.replace("BEGIN;", `BEGIN;\n${limpiarTablas}\n`);

      // 1. Restaurar la BD primero. Si esto falla, Postgres revierte todo.
      await ejecutarSQLMultiSentencia(sqlConLimpieza);

      // 2. Restaurar archivos de exámenes con el mismo patrón.
      const carpetaExamenesExtraida = path.join(carpetaTemp, "examenes");
      if (!fs.existsSync(carpetaExamenesExtraida)) {
        return; // El respaldo no incluía exámenes (BD sin archivos asociados)
      }

      const rutaExamenesDestino = obtenerRutaExamenes();
      const rutaExamenesRespaldoPrevio = `${rutaExamenesDestino}_respaldo_previo_${timestamp}`;
      const rutaExamenesNuevoTemporal = `${rutaExamenesDestino}_nuevo_${timestamp}`;

      // Copiar a una ubicación temporal, nunca directo al destino final
      await fsPromises.cp(carpetaExamenesExtraida, rutaExamenesNuevoTemporal, { recursive: true });

      // Verificar que la copia esté completa antes de tocar nada más
      const copiaValida = await verificarCopiaCompleta(carpetaExamenesExtraida, rutaExamenesNuevoTemporal);
      if (!copiaValida) {
        await fsPromises.rm(rutaExamenesNuevoTemporal, { recursive: true, force: true });
        throw new Error(
          "La base de datos se restauró correctamente, pero la copia de archivos de exámenes falló la verificación. " +
          "La BD ya refleja el respaldo restaurado; los archivos de exámenes NO se modificaron (se conservan los anteriores)."
        );
      }

      // Swap: mover el original a respaldo previo, mover el nuevo al destino final
      if (fs.existsSync(rutaExamenesDestino)) {
        await fsPromises.rename(rutaExamenesDestino, rutaExamenesRespaldoPrevio);
      }
      await fsPromises.rename(rutaExamenesNuevoTemporal, rutaExamenesDestino);

      // Todo confirmado: recién ahora se elimina el respaldo previo
      if (fs.existsSync(rutaExamenesRespaldoPrevio)) {
        await fsPromises.rm(rutaExamenesRespaldoPrevio, { recursive: true, force: true });
      }
    } finally {
      await fsPromises.rm(carpetaTemp, { recursive: true, force: true });
    }
  },
};