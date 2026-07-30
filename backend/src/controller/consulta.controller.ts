import { Request, Response } from "express";
import { consultaService } from "../services/consulta.service";

const CAMPOS_OBLIGATORIOS = [
    "fecha",
    "peso",
    "talla",
    "presion_sistolica",
    "presion_diastolica",
    "temperatura",
    "perimetro_cefalico",
    "motivo_consulta",
    "enfermedad_actual",
    "examen_fisico",
    "diagnostico"
];

function faltanCampos(body: Record<string,unknown>){
    return CAMPOS_OBLIGATORIOS.some((campo)=> body[campo] === undefined || body[campo] === null || body[campo] === "");
};

function normalizarFechaYNumeros(body: Record<string, unknown>) {
  const data: Record<string, unknown> = { ...body };
 
  if (data.fecha) data.fecha = new Date(data.fecha as string);
  if (data.peso !== undefined) data.peso = Number(data.peso);
  if (data.talla !== undefined) data.talla = Number(data.talla);
  if (data.presion_sistolica !== undefined) data.presion_sistolica = Number(data.presion_sistolica);
  if (data.presion_diastolica !== undefined) data.presion_diastolica = Number(data.presion_diastolica);
  if (data.temperatura !== undefined) data.temperatura = Number(data.temperatura);
  if (data.perimetro_cefalico !== undefined) data.perimetro_cefalico = Number(data.perimetro_cefalico);
 
  return data;
};

export const consultaController = {
  async listarPorPaciente(req: Request, res: Response) {
    try {
      const id_paciente = Number(req.params.id_paciente);
 
      if (Number.isNaN(id_paciente)) {
        res.status(400).json({ error: "El ID de paciente debe ser un número válido" });
        return;
      }
 
      const consultas = await consultaService.listarPorPaciente(id_paciente);
      res.json(consultas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al listar consultas" });
    }
  },
 
  async buscarPorId(req: Request, res: Response) {
    try {
      const id_consulta = Number(req.params.id);
 
      if (Number.isNaN(id_consulta)) {
        res.status(400).json({ error: "El ID debe ser un número válido" });
        return;
      }
 
      const consulta = await consultaService.buscarPorId(id_consulta);
 
      if (!consulta) {
        res.status(404).json({ error: "Consulta no encontrada" });
        return;
      }
 
      res.json(consulta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al buscar la consulta" });
    }
  },
 
  async crear(req: Request, res: Response) {
    try {
      const id_paciente = Number(req.params.id_paciente);
 
      if (Number.isNaN(id_paciente)) {
        res.status(400).json({ error: "El ID de paciente debe ser un número válido" });
        return;
      }
 
      if (faltanCampos(req.body)) {
        res.status(400).json({ error: "Faltan campos obligatorios" });
        return;
      }
 
      const data = normalizarFechaYNumeros(req.body);
 
      if (Number.isNaN((data.fecha as Date).getTime())) {
        res.status(400).json({ error: "La fecha debe tener un formato válido (AAAA-MM-DD)" });
        return;
      }
 
      const nuevaConsulta = await consultaService.crear(id_paciente, data as never);
 
      if (!nuevaConsulta) {
        res.status(404).json({ error: "Paciente no encontrado" });
        return;
      }
 
      res.status(201).json(nuevaConsulta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear la consulta" });
    }
  },
 
  async actualizar(req: Request, res: Response) {
    try {
      const id_consulta = Number(req.params.id);
 
      if (Number.isNaN(id_consulta)) {
        res.status(400).json({ error: "El ID debe ser un número válido" });
        return;
      }
 
      const data = normalizarFechaYNumeros(req.body);
 
      const consultaActualizada = await consultaService.actualizar(id_consulta, data as never);
 
      if (!consultaActualizada) {
        res.status(404).json({ error: "Consulta no encontrada" });
        return;
      }
 
      res.json(consultaActualizada);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al actualizar la consulta" });
    }
  },
 
  async eliminar(req: Request, res: Response) {
    try {
      const id_consulta = Number(req.params.id);
 
      if (Number.isNaN(id_consulta)) {
        res.status(400).json({ error: "El ID debe ser un número válido" });
        return;
      }
 
      const consultaEliminada = await consultaService.eliminar(id_consulta);
 
      if (!consultaEliminada) {
        res.status(404).json({ error: "Consulta no encontrada" });
        return;
      }
 
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar la consulta" });
    }
  },
};
 