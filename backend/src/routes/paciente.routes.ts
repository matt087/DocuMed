import { Router } from "express";
import { pacienteController } from "../controller/paciente.controller";

const router = Router();

router.get("/", pacienteController.listar);
router.get("/:id", pacienteController.buscarPorId);
router.post("/", pacienteController.crear);
router.put("/:id", pacienteController.actualizar);
router.delete("/:id", pacienteController.eliminar);

export default router;

