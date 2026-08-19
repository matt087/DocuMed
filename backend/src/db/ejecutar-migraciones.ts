import { spawn } from "child_process";
import path from "path";

export function ejecutarMigraciones(databaseUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const inicio = Date.now();

    console.log("Aplicando migraciones de Prisma...");

    const prismaCliPath = path.join(
      process.cwd(),
      "node_modules",
      "prisma",
      "build",
      "index.js"
    );

    console.log("Prisma CLI:", prismaCliPath);
    console.log("Iniciando proceso Prisma...");

    const proceso = spawn(
      process.execPath,
      [prismaCliPath, "migrate", "deploy"],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
        },
      }
    );

    console.log(
      `Prisma CLI iniciado en ${Date.now() - inicio} ms`
    );

    let stderr = "";

    proceso.stdout.on("data", (data) => {
      console.log(`[prisma] ${data.toString().trim()}`);
    });

    proceso.stderr.on("data", (data) => {
      const mensaje = data.toString();

      stderr += mensaje;

      console.error(`[prisma] ${mensaje.trim()}`);
    });

    proceso.on("close", (codigo) => {
      const duracion = Date.now() - inicio;

      console.log(
        `Proceso Prisma terminado en ${duracion} ms`
      );

      if (codigo === 0) {
        console.log(
          `Migraciones aplicadas correctamente en ${duracion} ms.`
        );
        resolve();
      } else {
        reject(
          new Error(
            `Falló la migración (código ${codigo}): ${stderr}`
          )
        );
      }
    });

    proceso.on("error", (error) => {
      reject(
        new Error(
          `No se pudo ejecutar el CLI de Prisma: ${error.message}`
        )
      );
    });
  });
}