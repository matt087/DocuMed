import { Router } from "express";
import { configuracionController } from "../controller/configuracion.controller";

export const configuracionRoutes = Router();
configuracionRoutes.get("/almacenamiento", configuracionController.obtenerAlmacenamiento);
configuracionRoutes.put("/almacenamiento", configuracionController.cambiarAlmacenamiento);
configuracionRoutes.post("/respaldo", configuracionController.generarRespaldo);