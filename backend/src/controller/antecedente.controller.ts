import { Request, Response } from "express";
import { antecedenteService } from "../services/antecedente.service";

export const antecedenteController = {
    async listarPorPaciente(req:Request, res:Response){
        try {
            const id_paciente = Number(req.params.id_paciente);
            if(Number.isNaN(id_paciente)){
                res.status(400).json({error: "El ID de paciente debe ser un número válido"});
                return;
            }

            const antecedentes = await antecedenteService.listarPorPaciente(id_paciente);
            res.json(antecedentes);

        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Error al listar antecedentes"});
        }
    },

    async buscarPorId(req:Request, res:Response){
        try {
            const id_antecedentes = Number(req.params.id);
            if(Number.isNaN(id_antecedentes)){
                res.status(400).json({error:"El ID del antecedente debe ser un número válido"})
                return;
            }

            const antecedente = await antecedenteService.buscarPorId(id_antecedentes);
            if(!antecedente){
                res.status(404).json({error:"Antecedente no encontrado"});
                return;
            }
            res.json(antecedente);

        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Error al listar antecedentes"});
        }
    },

    async crear(req:Request, res:Response){
        try {
            const id_paciente = Number(req.params.id_paciente);
            if(Number.isNaN(id_paciente)){
                res.status(400).json({error: "El ID de paciente debe ser un número válido"});
                return;
            }

            const {tipo, descripcion} = req.body;
            if(!tipo || !descripcion){
                res.status(404).json({error:"Existen campos faltantes en la solicitud"});
                return;
            }

            if (!antecedenteService.esTipoValido(tipo)) {
                res.status(400).json({ error: "El campo tipo debe ser 'Personal', 'Familiar' o 'GO'" });
                return;
            }

            const nuevoAntecedente = await antecedenteService.crear(id_paciente, req.body)
            if(!nuevoAntecedente){
                res.status(404).json({error: "Paciente no encontrado"});
                return;
            }

            res.status(201).json(nuevoAntecedente);
        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Error al crear antecedente"});
        }
    },

    async actualizar(req:Request, res:Response){
        try {
            const id_antecedentes = Number(req.params.id);
            if(Number.isNaN(id_antecedentes)){
                res.status(400).json({error:"El ID del antecedente debe ser un número válido"})
                return;
            }

            if(req.body.tipo && !antecedenteService.esTipoValido(req.body.tipo)){
                res.status(400).json({ error: "El campo tipo debe ser 'Personal', 'Familiar' o 'GO'" });
                return;
            }

            const antecedenteActualizado = await antecedenteService.actualizar(id_antecedentes, req.body);
            if(!antecedenteActualizado){
                res.status(404).json({ error: "Antecedente no encontrado" });
                return;
            }

            res.json(antecedenteActualizado);

        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Error al actualizar antecedente"});
        }
    },

    async eliminar(req:Request, res:Response){
        try {
            const id_antecedentes = Number(req.params.id);
            if(Number.isNaN(id_antecedentes)){
                res.status(400).json({error:"El ID del antecedente debe ser un número válido"})
                return;
            }

            const antecedenteEliminado = await antecedenteService.eliminar(id_antecedentes);

            if (!antecedenteEliminado) {
                res.status(404).json({ error: "Antecedente no encontrado" });
                return;
            }

            res.send(204).send();

        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Error al eliminar antecedente"});
        }
    },


};