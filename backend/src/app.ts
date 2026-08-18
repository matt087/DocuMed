import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
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

    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error fatal al iniciar el servidor:", error);
    process.exit(1);
  }
}

async function apagarLimpio(señal: string) {
  console.log(`\nSeñal ${señal} recibida. Cerrando servidor...`);
  await detenerPostgresEmbebido();
  process.exit(0);
}

process.on("SIGINT", () => apagarLimpio("SIGINT"));
process.on("SIGTERM", () => apagarLimpio("SIGTERM"));

process.on("uncaughtException", async (error) => {
  console.error("Excepción no capturada:", error);
  await detenerPostgresEmbebido();
  process.exit(1);
});

iniciarServidor();