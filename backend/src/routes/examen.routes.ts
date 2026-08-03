import { Router } from "express";
import { examenController } from "../controller/examen.controller";

export const examenRoutesNested = Router({ mergeParams: true });
examenRoutesNested.get("/", examenController.listarPorConsulta);
examenRoutesNested.post("/", examenController.crear);

export const examenRoutesFlat = Router();
examenRoutesFlat.get("/:id", examenController.buscarPorId);
examenRoutesFlat.put("/:id", examenController.actualizar);
examenRoutesFlat.delete("/:id", examenController.eliminar);