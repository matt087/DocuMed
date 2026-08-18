import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { prisma } from "../db/prisma";
import { obtenerRutaExamenes, establecerRutaExamenes } from "../config/app-config";

async function listarArchivosRecursivo(dir: string): Promise<string[]> {
  if (!fsSync.existsSync(dir)) return [];

  const entradas = await fs.readdir(dir, { withFileTypes: true });
  const archivos: string[] = [];

  for (const entrada of entradas) {
    const rutaCompleta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      archivos.push(...(await listarArchivosRecursivo(rutaCompleta)));
    } else {
      archivos.push(rutaCompleta);
    }
  }

  return archivos;
}

export const almacenamientoService = {
  async obtenerInfo() {
    const ruta = obtenerRutaExamenes();
    const archivos = await listarArchivosRecursivo(ruta);

    let espacioUsadoBytes = 0;
    for (const archivo of archivos) {
      const stats = await fs.stat(archivo);
      espacioUsadoBytes += stats.size;
    }

    return {
      ruta,
      cantidadArchivos: archivos.length,
      espacioUsadoBytes,
    };
  },

  async cambiarRuta(rutaNueva: string) {
    const rutaActual = obtenerRutaExamenes();

    if (path.resolve(rutaActual) === path.resolve(rutaNueva)) {
      throw new Error("La nueva ruta es igual a la actual.");
    }

    const existeCarpetaOrigen = fsSync.existsSync(rutaActual);

    if (!existeCarpetaOrigen) {
      await fs.mkdir(rutaNueva, { recursive: true });
      establecerRutaExamenes(rutaNueva);
      return { rutaAnterior: rutaActual, rutaNueva, archivosMovidos: 0 };
    }

    // 1. COPIAR
    await fs.mkdir(rutaNueva, { recursive: true });
    await fs.cp(rutaActual, rutaNueva, { recursive: true, force: true });

    // 2. VERIFICAR
    const archivosOriginales = await listarArchivosRecursivo(rutaActual);
    for (const archivoOriginal of archivosOriginales) {
      const relativo = path.relative(rutaActual, archivoOriginal);
      const archivoCopia = path.join(rutaNueva, relativo);

      if (!fsSync.existsSync(archivoCopia)) {
        await fs.rm(rutaNueva, { recursive: true, force: true });
        throw new Error(`Falló la verificación: no se encontró ${relativo} en la nueva ubicación.`);
      }

      const statsOriginal = await fs.stat(archivoOriginal);
      const statsCopia = await fs.stat(archivoCopia);

      if (statsOriginal.size !== statsCopia.size) {
        await fs.rm(rutaNueva, { recursive: true, force: true });
        throw new Error(`Falló la verificación: el archivo ${relativo} no coincide en tamaño.`);
      }
    }

    // 3. ACTUALIZAR
    const examenes = await prisma.examen.findMany();
    const actualizaciones = examenes
      .filter((ex) => ex.ruta_archivo.startsWith(rutaActual))
      .map((ex) => {
        const relativo = path.relative(rutaActual, ex.ruta_archivo);
        const rutaNuevaArchivo = path.join(rutaNueva, relativo);
        return prisma.examen.update({
          where: { id_examen: ex.id_examen },
          data: { ruta_archivo: rutaNuevaArchivo },
        });
      });

    try {
      await prisma.$transaction(actualizaciones);
    } catch (error) {
      await fs.rm(rutaNueva, { recursive: true, force: true });
      throw new Error("Falló la actualización de la base de datos. No se modificó nada.");
    }

    // 4. ELIMINAR ORIGINAL
    await fs.rm(rutaActual, { recursive: true, force: true });

    // 5. PERSISTIR
    establecerRutaExamenes(rutaNueva);

    return { rutaAnterior: rutaActual, rutaNueva, archivosMovidos: archivosOriginales.length };
  },
};