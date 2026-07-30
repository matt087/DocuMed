import { Request, Response } from "express";
import { indicacionService } from "../services/indicaciones.service";

export const indicacionController = {
    async listarPorConsulta(req: Request, res: Response) {
        try {
            const id_consulta = Number(req.params.id_consulta);

            if (Number.isNaN(id_consulta)) {
                res.status(400).json({ error: "El ID de consulta debe ser un número válido" });
                return;
            }

            const indicaciones = await indicacionService.listarPorConsulta(id_consulta);
            res.json(indicaciones);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al listar indicaciones" });
        }
    },

    async buscarPorId(req: Request, res: Response) {
        try {
            const id_indicacion = Number(req.params.id);

            if (Number.isNaN(id_indicacion)) {
                res.status(400).json({ error: "El ID debe ser un número válido" });
                return;
            }

            const indicacion = await indicacionService.buscarPorId(id_indicacion);

            if (!indicacion) {
                res.status(404).json({ error: "Indicación no encontrada" });
                return;
            }

            res.json(indicacion);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al buscar la indicación" });
        }
    },

    async crear(req: Request, res: Response) {
        try {
            const id_consulta = Number(req.params.id_consulta);

            if (Number.isNaN(id_consulta)) {
                res.status(400).json({ error: "El ID de consulta debe ser un número válido" });
                return;
            }

            const { indicacion } = req.body;

            if (!indicacion) {
                res.status(400).json({ error: "Falta el campo indicacion" });
                return;
            }

            const nuevaIndicacion = await indicacionService.crear(id_consulta, req.body);

            if (!nuevaIndicacion) {
                res.status(404).json({ error: "Consulta no encontrada" });
                return;
            }

            res.status(201).json(nuevaIndicacion);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al crear la indicación" });
        }
    },

    async actualizar(req: Request, res: Response) {
        try {
            const id_indicacion = Number(req.params.id);

            if (Number.isNaN(id_indicacion)) {
                res.status(400).json({ error: "El ID debe ser un número válido" });
                return;
            }

            const indicacionActualizada = await indicacionService.actualizar(id_indicacion, req.body);

            if (!indicacionActualizada) {
                res.status(404).json({ error: "Indicación no encontrada" });
                return;
            }

            res.json(indicacionActualizada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al actualizar la indicación" });
        }
    },

    async eliminar(req: Request, res: Response) {
        try {
            const id_indicacion = Number(req.params.id);

            if (Number.isNaN(id_indicacion)) {
                res.status(400).json({ error: "El ID debe ser un número válido" });
                return;
            }

            const indicacionEliminada = await indicacionService.eliminar(id_indicacion);

            if (!indicacionEliminada) {
                res.status(404).json({ error: "Indicación no encontrada" });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al eliminar la indicación" });
        }
    },
};