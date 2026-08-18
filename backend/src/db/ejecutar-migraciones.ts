import { spawn } from "child_process";
import path from "path";

export function ejecutarMigraciones(databaseUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("Aplicando migraciones de Prisma...");

    const prismaCliPath = path.join(
      process.cwd(),
      "node_modules",
      "prisma",
      "build",
      "index.js"
    );

    const proceso = spawn(
      process.execPath,
      [prismaCliPath, "migrate", "deploy"],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: databaseUrl },
      }
    );

    let stderr = "";
    proceso.stdout.on("data", (data) => console.log(data.toString()));
    proceso.stderr.on("data", (data) => { stderr += data.toString(); });

    proceso.on("close", (codigo) => {
      if (codigo === 0) {
        console.log("Migraciones aplicadas correctamente.");
        resolve();
      } else {
        reject(new Error(`Falló la migración (código ${codigo}): ${stderr}`));
      }
    });

    proceso.on("error", (error) => {
      reject(new Error(`No se pudo ejecutar el CLI de Prisma: ${error.message}`));
    });
  });
}