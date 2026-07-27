import { Router } from "express";
import { antecedenteController } from "../controller/antecedente.controller";

export const antecedenteRoutesNested = Router({ mergeParams: true });
antecedenteRoutesNested.get("/", antecedenteController.listarPorPaciente);
antecedenteRoutesNested.post("/", antecedenteController.crear);

export const antecedenteRoutesFlat = Router();
antecedenteRoutesFlat.get("/:id", antecedenteController.buscarPorId);
antecedenteRoutesFlat.put("/:id", antecedenteController.actualizar);
antecedenteRoutesFlat.delete("/:id", antecedenteController.eliminar);