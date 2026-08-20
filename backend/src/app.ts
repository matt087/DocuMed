import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";

import { iniciarPostgresEmbebido, detenerPostgresEmbebido } from "./db/postgres-manager";
import { ejecutarMigraciones } from "./db/ejecutar-migraciones";
import { inicializarPrisma } from "./db/prisma";
import pacienteRoutes from "./routes/paciente.routes";
import { contactoRoutesFlat } from "./routes/contacto.routes";
import { antecedenteRoutesFlat } from "./routes/antecedente.routes";
import { consultaRoutesFlat } from "./routes/consulta.routes";
import { indicacionRoutesFlat } from "./routes/indicaciones.routes";
import { examenRoutesFlat } from "./routes/examen.routes";
import { configuracionRoutes } from "./routes/configuracion.routes";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function iniciarServidor() {
  try {
    const databaseUrl = await iniciarPostgresEmbebido();
    await ejecutarMigraciones(databaseUrl);
    inicializarPrisma(databaseUrl);

    const app = express();

    app.use(
      cors({
        origin: "http://localhost:4200",
      })
    );
    app.use(express.json());

    app.get("/", (_req: Request, res: Response) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    });

    app.use("/pacientes", pacienteRoutes);
    app.use("/contactos", contactoRoutesFlat);
    app.use("/antecedentes", antecedenteRoutesFlat);
    app.use("/consultas", consultaRoutesFlat);
    app.use("/indicaciones", indicacionRoutesFlat);
    app.use("/examenes", examenRoutesFlat);
    app.use("/configuracion", configuracionRoutes);

    app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
      console.error("Error no manejado:", err);

      if (err instanceof multer.MulterError) {
        res.status(400).json({ error: `Error al procesar el archivo: ${err.message}` });
        return;
      }

      res.status(500).json({ error: err.message || "Error interno del servidor" });
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error fatal al iniciar el servidor:", error);
    process.exit(1);
  }
}

let apagando = false;

async function apagarLimpio(origen: string) {
  if (apagando) {
    return;
  }

  apagando = true;

  console.log(`\nSolicitud de cierre recibida (${origen}). Cerrando servidor...`);

  try {
    await detenerPostgresEmbebido();
  } catch (error) {
    console.error("Error al detener PostgreSQL embebido:", error);
  } finally {
    process.exit(0);
  }
}

process.stdin.on("data", (data) => {
  const comando = data.toString().trim();

  if (comando === "shutdown") {
    void apagarLimpio("Electron");
  }
});

process.on("SIGINT", () => {
  void apagarLimpio("SIGINT");
});

process.on("SIGTERM", () => {
  void apagarLimpio("SIGTERM");
});

process.on("uncaughtException", async (error) => {
  console.error("Excepción no capturada:", error);
  await detenerPostgresEmbebido();
  process.exit(1);
});

iniciarServidor();