import multer from "multer";
import path from "path";
import fs from "fs";
import { obtenerPrisma } from "../db/prisma";
import { obtenerRutaExamenes } from "../config/app-config";
//const BASE_UPLOAD_DIR = path.join(process.cwd(), "uploads", "examenes");

const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    try {
      const id_consulta = Number(req.params.id_consulta);
      const prisma = obtenerPrisma();
      const consulta = await prisma.consulta.findFirst({
        where: { id_consulta, deleted_at: null },
      });

      if (!consulta) {
        cb(new Error("Consulta no encontrada"), "");
        return;
      }

      const fechaCarpeta = consulta.fecha.toISOString().slice(0, 10);
      const destino = path.join(
        obtenerRutaExamenes(),
        fechaCarpeta,
        `consulta_${id_consulta}`
      );

      fs.mkdirSync(destino, { recursive: true });
      cb(null, destino);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename: (_req, file, cb) => {
    const nombreUnico = `${Date.now()}-${file.originalname}`;
    cb(null, nombreUnico);
  },
});

export const uploadExamen = multer({ storage });