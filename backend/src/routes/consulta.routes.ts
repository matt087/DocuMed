import { Router } from "express";
import { consultaController } from "../controller/consulta.controller";
import { indicacionRoutesNested } from "./indicaciones.routes";
import { examenRoutesNested } from "./examen.routes";
 
export const consultaRoutesNested = Router({ mergeParams: true });
consultaRoutesNested.get("/", consultaController.listarPorPaciente);
consultaRoutesNested.post("/", consultaController.crear);
 
export const consultaRoutesFlat = Router();
consultaRoutesFlat.get("/:id", consultaController.buscarPorId);
consultaRoutesFlat.put("/:id", consultaController.actualizar);
consultaRoutesFlat.delete("/:id", consultaController.eliminar);+

consultaRoutesFlat.use("/:id_consulta/indicaciones", indicacionRoutesNested);
consultaRoutesFlat.use("/:id_consulta/examenes", examenRoutesNested); 