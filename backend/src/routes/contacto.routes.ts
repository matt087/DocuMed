import { Router } from "express";
import { contactoController } from "../controller/contacto.controller";

export const contactoRoutesNested = Router({mergeParams: true});
contactoRoutesNested.get("/", contactoController.listarPorPaciente)
contactoRoutesNested.post("/", contactoController.crear)

export const contactoRoutesFlat = Router();
contactoRoutesFlat.get("/:id", contactoController.buscarPorId);
contactoRoutesFlat.put("/:id", contactoController.actualizar);
contactoRoutesFlat.delete("/:id", contactoController.eliminar);