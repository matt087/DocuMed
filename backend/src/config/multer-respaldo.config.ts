import multer from "multer";
import path from "path";
import fs from "fs";
import { obtenerCarpetaDatos } from "./rutas-datos";

const carpetaTempSubidas = path.join(obtenerCarpetaDatos(), "temp", "subidas-respaldo");
fs.mkdirSync(carpetaTempSubidas, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, carpetaTempSubidas);
  },
  filename: (_req, file, cb) => {
    const nombreUnico = `${Date.now()}-${file.originalname}`;
    cb(null, nombreUnico);
  },
});

function filtroSoloZip(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype === "application/zip" || file.originalname.toLowerCase().endsWith(".zip")) {
    cb(null, true);
  } else {
    cb(new Error("El archivo debe ser un .zip"));
  }
}

export const uploadRespaldo = multer({ storage, fileFilter: filtroSoloZip });