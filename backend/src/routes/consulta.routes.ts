import { Router } from "express";
import { consultaController } from "../controller/consulta.controller";
 
export const consultaRoutesNested = Router({ mergeParams: true });
consultaRoutesNested.get("/", consultaController.listarPorPaciente);
consultaRoutesNested.post("/", consultaController.crear);
 
export const consultaRoutesFlat = Router();
consultaRoutesFlat.get("/:id", consultaController.buscarPorId);
consultaRoutesFlat.put("/:id", consultaController.actualizar);
consultaRoutesFlat.delete("/:id", consultaController.eliminar);
 