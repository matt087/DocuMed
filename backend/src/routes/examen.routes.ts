import { Router } from "express";
import { examenController } from "../controller/examen.controller";
import { uploadExamen } from "../config/multer.config";

export const examenRoutesNested = Router({ mergeParams: true });
examenRoutesNested.get("/", examenController.listarPorConsulta);
examenRoutesNested.post("/", uploadExamen.single("archivo"), examenController.crear);

export const examenRoutesFlat = Router();
examenRoutesFlat.get("/:id", examenController.buscarPorId);
examenRoutesFlat.put("/:id", examenController.actualizar);
examenRoutesFlat.delete("/:id", examenController.eliminar);