import { Router } from "express";
import { pacienteController } from "../controller/paciente.controller";
import { contactoRoutesNested } from "./contacto.routes";

const router = Router();

router.get("/", pacienteController.listar);
router.get("/:id", pacienteController.buscarPorId);
router.post("/", pacienteController.crear);
router.put("/:id", pacienteController.actualizar);
router.delete("/:id", pacienteController.eliminar);

router.use("/:id_paciente/contactos", contactoRoutesNested);

export default router;

