import { Router } from "express";
import { pacienteController } from "../controller/paciente.controller";
import { contactoRoutesNested } from "./contacto.routes";
import { antecedenteRoutesNested } from "./antecedente.routes";
import { consultaRoutesNested } from "./consulta.routes";

const router = Router();

router.get("/", pacienteController.listar);
router.get("/:id", pacienteController.buscarPorId);
router.post("/", pacienteController.crear);
router.put("/:id", pacienteController.actualizar);
router.delete("/:id", pacienteController.eliminar);

router.use("/:id_paciente/contactos", contactoRoutesNested);
router.use("/:id_paciente/antecedentes", antecedenteRoutesNested);
router.use("/:id_paciente/consultas", consultaRoutesNested);

export default router;

