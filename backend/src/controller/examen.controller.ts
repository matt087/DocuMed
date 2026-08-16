import { Request, Response } from "express";
import { examenService } from "../services/examen.service";

export const examenController = {
  async listarPorConsulta(req: Request, res: Response) {
    try {
      const id_consulta = Number(req.params.id_consulta);

      if (Number.isNaN(id_consulta)) {
        res.status(400).json({ error: "El ID de consulta debe ser un número válido" });
        return;
      }

      const examenes = await examenService.listarPorConsulta(id_consulta);
      res.json(examenes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al listar exámenes" });
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id_examen = Number(req.params.id);

      if (Number.isNaN(id_examen)) {
        res.status(400).json({ error: "El ID debe ser un número válido" });
        return;
      }

      const examen = await examenService.buscarPorId(id_examen);

      if (!examen) {
        res.status(404).json({ error: "Examen no encontrado" });
        return;
      }

      res.json(examen);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al buscar el examen" });
    }
  },

  async crear(req: Request, res: Response) {
    try {
      const id_consulta = Number(req.params.id_consulta);

      if (Number.isNaN(id_consulta)) {
        res.status(400).json({ error: "El ID de consulta debe ser un número válido" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "Debes seleccionar un archivo" });
        return;
      }

      const nuevoExamen = await examenService.crear(id_consulta, {
        ruta_archivo: req.file.path,
        fecha: new Date(),
      });

      if (!nuevoExamen) {
        res.status(404).json({ error: "Consulta no encontrada" });
        return;
      }

      res.status(201).json(nuevoExamen);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear el examen" });
    }
  },

  async actualizar(req: Request, res: Response) {
    try {
      const id_examen = Number(req.params.id);

      if (Number.isNaN(id_examen)) {
        res.status(400).json({ error: "El ID debe ser un número válido" });
        return;
      }

      const data = { ...req.body };

      if (data.fecha) {
        const fechaConvertida = new Date(data.fecha);

        if (Number.isNaN(fechaConvertida.getTime())) {
          res.status(400).json({ error: "La fecha debe tener un formato válido (AAAA-MM-DD)" });
          return;
        }

        data.fecha = fechaConvertida;
      }

      const examenActualizado = await examenService.actualizar(id_examen, data);

      if (!examenActualizado) {
        res.status(404).json({ error: "Examen no encontrado" });
        return;
      }

      res.json(examenActualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al actualizar el examen" });
    }
  },

  async eliminar(req: Request, res: Response) {
    try {
      const id_examen = Number(req.params.id);

      if (Number.isNaN(id_examen)) {
        res.status(400).json({ error: "El ID debe ser un número válido" });
        return;
      }

      const examenEliminado = await examenService.eliminar(id_examen);

      if (!examenEliminado) {
        res.status(404).json({ error: "Examen no encontrado" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar el examen" });
    }
  },

  async descargar(req: Request, res: Response) {
    try {
      const id_examen = Number(req.params.id);

      if (Number.isNaN(id_examen)) {
        res.status(400).json({ error: "El ID debe ser un número válido" });
        return;
      }

      const examen = await examenService.buscarPorId(id_examen);

      if (!examen) {
        res.status(404).json({ error: "Examen no encontrado" });
        return;
      }

      res.sendFile(examen.ruta_archivo, (error) => {
        if (error && !res.headersSent) {
          res.status(404).json({ error: "El archivo no se encontró en el sistema" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al abrir el examen" });
    }
  },
};