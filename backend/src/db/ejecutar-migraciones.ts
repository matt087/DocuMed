import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

function obtenerCarpetaMigraciones(): string {
  return path.join(process.cwd(), "prisma", "migrations");
}

function extraerRutaArchivo(databaseUrl: string): string {
  return databaseUrl.replace(/^file:/, "");
}

export async function ejecutarMigraciones(databaseUrl: string): Promise<void> {
  const inicio = Date.now();
  const rutaArchivo = extraerRutaArchivo(databaseUrl);
  const carpetaMigraciones = obtenerCarpetaMigraciones();

  console.log("Aplicando migraciones de SQLite...");
  console.log("Carpeta de migraciones:", carpetaMigraciones);

  const db = new Database(rutaArchivo);

  try {
    db.pragma("journal_mode = WAL");

    db.exec(`
      CREATE TABLE IF NOT EXISTS _documed_migraciones (
        nombre TEXT PRIMARY KEY,
        aplicada_en TEXT NOT NULL
      )
    `);

    if (!fs.existsSync(carpetaMigraciones)) {
      console.log("No se encontró carpeta de migraciones, se omite.");
      return;
    }

    const carpetas = fs
      .readdirSync(carpetaMigraciones, { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory())
      .map((entrada) => entrada.name)
      .sort();

    const yaAplicadas = new Set(
      (db.prepare("SELECT nombre FROM _documed_migraciones").all() as { nombre: string }[])
        .map((fila) => fila.nombre)
    );

    for (const carpeta of carpetas) {
      if (yaAplicadas.has(carpeta)) continue;

      const rutaSql = path.join(carpetaMigraciones, carpeta, "migration.sql");
      if (!fs.existsSync(rutaSql)) {
        console.warn(`Migración ${carpeta} no tiene migration.sql, se omite.`);
        continue;
      }

      const sql = fs.readFileSync(rutaSql, "utf-8");
      console.log(`Aplicando migración: ${carpeta}`);

      const aplicar = db.transaction(() => {
        db.exec(sql);
        db.prepare(
          "INSERT INTO _documed_migraciones (nombre, aplicada_en) VALUES (?, ?)"
        ).run(carpeta, new Date().toISOString());
      });

      aplicar();
    }

    console.log(`Migraciones aplicadas correctamente en ${Date.now() - inicio} ms.`);
  } finally {
    db.close();
  }
}