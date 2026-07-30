import { Router } from "express";
import { indicacionController } from "../controller/indicaciones.controller";

export const indicacionRoutesNested = Router({ mergeParams: true });
indicacionRoutesNested.get("/", indicacionController.listarPorConsulta);
indicacionRoutesNested.post("/", indicacionController.crear);

export const indicacionRoutesFlat = Router();
indicacionRoutesFlat.get("/:id", indicacionController.buscarPorId);
indicacionRoutesFlat.put("/:id", indicacionController.actualizar);
indicacionRoutesFlat.delete("/:id", indicacionController.eliminar);