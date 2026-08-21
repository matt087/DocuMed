import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
const archiver = require("archiver");
import AdmZip from "adm-zip";
import Database from "better-sqlite3";

import { obtenerRutaExamenes } from "../config/app-config";
import { obtenerCarpetaDatos } from "../config/rutas-datos";
import { obtenerPrisma } from "../db/prisma";

// =====================================================
// GENERAR RESPALDO
// =====================================================

function escaparValor(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return "NULL";
  }

  if (valor instanceof Date) {
    return `'${valor.toISOString().replace(/'/g, "''")}'`;
  }

  if (typeof valor === "number") {
    return valor.toString();
  }

  if (typeof valor === "boolean") {
    return valor ? "1" : "0";
  }

  return `'${String(valor).replace(/'/g, "''")}'`;
}

function generarInsertsTabla(
  nombreTabla: string,
  filas: Record<string, unknown>[]
): string {
  if (filas.length === 0) {
    return "";
  }

  const columnas = Object.keys(filas[0]);

  const lineas = filas.map((fila) => {
    const valores = columnas
      .map((columna) => escaparValor(fila[columna]))
      .join(", ");

    return `INSERT INTO "${nombreTabla}" (${columnas
      .map((columna) => `"${columna}"`)
      .join(", ")}) VALUES (${valores});`;
  });

  return lineas.join("\n") + "\n";
}

async function obtenerTodasLasTablas() {
  const prisma = obtenerPrisma();

  return {
    pacientes: await prisma.paciente.findMany({
      orderBy: {
        id_paciente: "asc",
      },
    }),

    contactos: await prisma.contacto.findMany({
      orderBy: {
        id_contacto: "asc",
      },
    }),

    antecedentes: await prisma.antecedente.findMany({
      orderBy: {
        id_antecedentes: "asc",
      },
    }),

    consultas: await prisma.consulta.findMany({
      orderBy: {
        id_consulta: "asc",
      },
    }),

    indicaciones: await prisma.indicacion.findMany({
      orderBy: {
        id_indicacion: "asc",
      },
    }),

    examenes: await prisma.examen.findMany({
      orderBy: {
        id_examen: "asc",
      },
    }),
  };
}

async function generarDumpSQL(): Promise<string> {
  const tablas = await obtenerTodasLasTablas();

  return [
    `-- Respaldo DocuMed`,
    `-- Generado: ${new Date().toISOString()}`,
    `-- Motor: SQLite`,
    "",
    "BEGIN TRANSACTION;",
    "",

    generarInsertsTabla("pacientes", tablas.pacientes),
    generarInsertsTabla("contactos", tablas.contactos),
    generarInsertsTabla("antecedentes", tablas.antecedentes),
    generarInsertsTabla("consultas", tablas.consultas),
    generarInsertsTabla("indicaciones", tablas.indicaciones),
    generarInsertsTabla("examenes", tablas.examenes),

    "COMMIT;",
  ].join("\n");
}

// =====================================================
// ZIP
// =====================================================

function comprimirEnZip(
  archivos: {
    rutaOrigen: string;
    nombreEnZip: string;
  }[],

  carpetas: {
    rutaOrigen: string;
    nombreEnZip: string;
  }[],

  rutaZipSalida: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(rutaZipSalida);

    const archive = archiver("zip", {
      zlib: {
        level: 9,
      },
    });

    output.on("close", () => {
      resolve();
    });

    archive.on("error", (error: Error) => {
      reject(error);
    });

    archive.pipe(output);

    for (const archivo of archivos) {
      archive.file(archivo.rutaOrigen, {
        name: archivo.nombreEnZip,
      });
    }

    for (const carpeta of carpetas) {
      if (fs.existsSync(carpeta.rutaOrigen)) {
        archive.directory(
          carpeta.rutaOrigen,
          carpeta.nombreEnZip
        );
      }
    }

    archive.finalize();
  });
}

// =====================================================
// EJECUTAR SQL SQLITE
// =====================================================

function obtenerRutaBaseDatos(): string {
  return path.join(
    obtenerCarpetaDatos(),
    "documed.db"
  );
}

async function ejecutarSQLMultiSentencia(
  sql: string
): Promise<void> {
  const rutaBaseDatos = obtenerRutaBaseDatos();

  const db = new Database(rutaBaseDatos);

  try {
    db.exec(sql);
  } finally {
    db.close();
  }
}

// =====================================================
// ARCHIVOS
// =====================================================

async function obtenerListaArchivosConTamano(
  dir: string
): Promise<Map<string, number>> {
  const resultado = new Map<string, number>();

  async function recorrer(
    carpetaActual: string,
    prefijoRelativo: string
  ) {
    const entradas = await fsPromises.readdir(
      carpetaActual,
      {
        withFileTypes: true,
      }
    );

    for (const entrada of entradas) {
      const rutaCompleta = path.join(
        carpetaActual,
        entrada.name
      );

      const rutaRelativa = path.join(
        prefijoRelativo,
        entrada.name
      );

      if (entrada.isDirectory()) {
        await recorrer(
          rutaCompleta,
          rutaRelativa
        );
      } else {
        const stats = await fsPromises.stat(
          rutaCompleta
        );

        resultado.set(
          rutaRelativa,
          stats.size
        );
      }
    }
  }

  if (fs.existsSync(dir)) {
    await recorrer(dir, "");
  }

  return resultado;
}

async function verificarCopiaCompleta(
  origen: string,
  destino: string
): Promise<boolean> {
  const archivosOrigen =
    await obtenerListaArchivosConTamano(origen);

  const archivosDestino =
    await obtenerListaArchivosConTamano(destino);

  if (
    archivosOrigen.size !== archivosDestino.size
  ) {
    return false;
  }

  for (
    const [
      rutaRelativa,
      tamanoOrigen,
    ] of archivosOrigen
  ) {
    const tamanoDestino =
      archivosDestino.get(rutaRelativa);

    if (
      tamanoDestino === undefined ||
      tamanoDestino !== tamanoOrigen
    ) {
      return false;
    }
  }

  return true;
}

// =====================================================
// SERVICIO
// =====================================================

export const respaldoService = {

  // ===================================================
  // GENERAR
  // ===================================================

  async generar(): Promise<{
    rutaZip: string;
    nombreArchivo: string;
  }> {

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const carpetaTemp = path.join(
      obtenerCarpetaDatos(),
      "temp",
      `respaldo_${timestamp}`
    );

    await fsPromises.mkdir(
      carpetaTemp,
      {
        recursive: true,
      }
    );

    const rutaSqlTemp = path.join(
      carpetaTemp,
      "base_de_datos.sql"
    );

    try {
      console.log(
        "Generando respaldo de la base de datos..."
      );

      const sql = await generarDumpSQL();

      await fsPromises.writeFile(
        rutaSqlTemp,
        sql,
        "utf-8"
      );

      const rutaExamenes =
        obtenerRutaExamenes();

      const nombreZip =
        `DocuMed_respaldo_${timestamp}.zip`;

      const carpetaSalida = path.join(
        obtenerCarpetaDatos(),
        "respaldos"
      );

      await fsPromises.mkdir(
        carpetaSalida,
        {
          recursive: true,
        }
      );

      const rutaZipFinal = path.join(
        carpetaSalida,
        nombreZip
      );

      console.log(
        "Comprimiendo respaldo..."
      );

      await comprimirEnZip(
        [
          {
            rutaOrigen: rutaSqlTemp,
            nombreEnZip:
              "base_de_datos.sql",
          },
        ],
        [
          {
            rutaOrigen: rutaExamenes,
            nombreEnZip: "examenes",
          },
        ],
        rutaZipFinal
      );

      console.log(
        "Respaldo generado correctamente."
      );

      return {
        rutaZip: rutaZipFinal,
        nombreArchivo: nombreZip,
      };

    } finally {

      await fsPromises.rm(
        carpetaTemp,
        {
          recursive: true,
          force: true,
        }
      );
    }
  },

  // ===================================================
  // RESTAURAR
  // ===================================================

  async restaurar(
    rutaZip: string
  ): Promise<void> {

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const carpetaTemp = path.join(
      obtenerCarpetaDatos(),
      "temp",
      `restauracion_${timestamp}`
    );

    await fsPromises.mkdir(
      carpetaTemp,
      {
        recursive: true,
      }
    );

    try {

      console.log(
        "Extrayendo respaldo..."
      );

      const zip = new AdmZip(
        rutaZip
      );

      zip.extractAllTo(
        carpetaTemp,
        true
      );

      const rutaSqlExtraido =
        path.join(
          carpetaTemp,
          "base_de_datos.sql"
        );

      if (
        !fs.existsSync(
          rutaSqlExtraido
        )
      ) {
        throw new Error(
          "El archivo de respaldo no contiene 'base_de_datos.sql'. ¿Es un respaldo válido de DocuMed?"
        );
      }

      const sql =
        await fsPromises.readFile(
          rutaSqlExtraido,
          "utf-8"
        );

      // Verificación básica del respaldo

      if (
        !sql.includes(
          "BEGIN TRANSACTION;"
        )
      ) {
        throw new Error(
          "El archivo de respaldo no tiene el formato esperado. ¿Es un respaldo válido de DocuMed?"
        );
      }

      // =================================================
      // LIMPIAR TABLAS SQLITE
      // =================================================

      const limpiarTablas = `

DELETE FROM examenes;
DELETE FROM indicaciones;
DELETE FROM consultas;
DELETE FROM antecedentes;
DELETE FROM contactos;
DELETE FROM pacientes;

DELETE FROM sqlite_sequence
WHERE name IN (
  'examenes',
  'indicaciones',
  'consultas',
  'antecedentes',
  'contactos',
  'pacientes'
);

`;

      const sqlConLimpieza =
        sql.replace(
          "BEGIN TRANSACTION;",
          `BEGIN TRANSACTION;
${limpiarTablas}`
        );

      console.log(
        "Restaurando base de datos..."
      );

      // Si cualquier INSERT falla,
      // SQLite revierte toda la transacción.

      await ejecutarSQLMultiSentencia(
        sqlConLimpieza
      );

      console.log(
        "Base de datos restaurada correctamente."
      );

      // =================================================
      // RESTAURAR EXAMENES
      // =================================================

      const carpetaExamenesExtraida =
        path.join(
          carpetaTemp,
          "examenes"
        );

      // El backup puede no contener exámenes.

      if (
        !fs.existsSync(
          carpetaExamenesExtraida
        )
      ) {
        console.log(
          "El respaldo no contiene archivos de exámenes."
        );

        return;
      }

      const rutaExamenesDestino =
        obtenerRutaExamenes();

      const rutaExamenesRespaldoPrevio =
        `${rutaExamenesDestino}_respaldo_previo_${timestamp}`;

      const rutaExamenesNuevoTemporal =
        `${rutaExamenesDestino}_nuevo_${timestamp}`;

      console.log(
        "Preparando restauración de exámenes..."
      );

      // Copiar primero a ubicación temporal.

      await fsPromises.cp(
        carpetaExamenesExtraida,
        rutaExamenesNuevoTemporal,
        {
          recursive: true,
        }
      );

      // Verificar que todo se copió correctamente.

      const copiaValida =
        await verificarCopiaCompleta(
          carpetaExamenesExtraida,
          rutaExamenesNuevoTemporal
        );

      if (!copiaValida) {

        await fsPromises.rm(
          rutaExamenesNuevoTemporal,
          {
            recursive: true,
            force: true,
          }
        );

        throw new Error(
          "La base de datos se restauró correctamente, pero la copia de archivos de exámenes falló la verificación. " +
          "Los archivos anteriores no fueron modificados."
        );
      }

      // =================================================
      // SWAP SEGURO
      // =================================================

      if (
        fs.existsSync(
          rutaExamenesDestino
        )
      ) {
        await fsPromises.rename(
          rutaExamenesDestino,
          rutaExamenesRespaldoPrevio
        );
      }

      await fsPromises.rename(
        rutaExamenesNuevoTemporal,
        rutaExamenesDestino
      );

      // Solo eliminamos el respaldo anterior
      // cuando todo terminó correctamente.

      if (
        fs.existsSync(
          rutaExamenesRespaldoPrevio
        )
      ) {
        await fsPromises.rm(
          rutaExamenesRespaldoPrevio,
          {
            recursive: true,
            force: true,
          }
        );
      }

      console.log(
        "Restauración completada correctamente."
      );

    } finally {

      await fsPromises.rm(
        carpetaTemp,
        {
          recursive: true,
          force: true,
        }
      );
    }
  },
};