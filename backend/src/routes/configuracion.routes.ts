import { Router } from "express";
import { configuracionController } from "../controller/configuracion.controller";
import { uploadRespaldo } from "../config/multer-respaldo.config";

export const configuracionRoutes = Router();
configuracionRoutes.get("/almacenamiento", configuracionController.obtenerAlmacenamiento);
configuracionRoutes.put("/almacenamiento", configuracionController.cambiarAlmacenamiento);
configuracionRoutes.post("/respaldo", configuracionController.generarRespaldo);
configuracionRoutes.post("/respaldo/restaurar", uploadRespaldo.single("archivo"), configuracionController.restaurarRespaldo);