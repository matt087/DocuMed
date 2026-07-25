import { Request, Response } from "express";
import {contactoService} from "../services/contacto.service";

export const contactoController = {
    async listarPorPaciente (req:Request, res:Response){
        try{
            const id_paciente = Number(req.params.id_paciente);
            if(Number.isNaN(id_paciente)){
                res.status(400).json({error: "El ID de paciente debe ser un número válido"});
                return;
            }

            const contactos = await contactoService.listarPorPaciente(id_paciente);
            res.json(contactos);
        }
        catch (error){
            console.error(error);
            res.status(500).json({error: "Error al listar contactos"});
        }
    },

    async buscarPorId(req: Request, res: Response){
        try {
            const id_contacto = Number(req.params.id);
            if(Number.isNaN(id_contacto)){
                res.status(400).json({error:"El ID del contacto debe ser un número válido"});
                return;
            }

            const contacto = await contactoService.buscarPorId(id_contacto);
            if(!contacto){
                res.status(404).json({error:"El contacto no ha sido encontrado"});
                return;
            }

            res.json(contacto);

        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Error al buscar contacto"});
        }
    },

    async crear(req: Request, res: Response){
        try {
            const id_paciente = Number(req.params.id_paciente);
            if(Number.isNaN(id_paciente)){
                res.status(400).json({error:"El ID de paciente debe ser un número válido"});
                return;
            }

            const {nombres, relacion, telefono} = req.body;
            if(!nombres || !relacion || !telefono){
                res.status(400).json({error: "Existen campos faltantes en la solicitud"});
                return;
            }

            const nuevoContacto = await contactoService.crear(id_paciente, req.body);
            if(!nuevoContacto){
                res.status(404).json({error: "Paciente no encontrado"});
                return;
            }

            res.status(201).json(nuevoContacto);

        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Error al crear un paciente"});
        }
    },

    async actualizar(req:Request, res: Response){
        try {
            const id_contacto = Number(req.params.id);
            if(Number.isNaN(id_contacto)){
                res.status(400).json({error:"El ID del contacto debe ser un número válido"});
                return;
            }

            const contactoActualizado = await contactoService.actualizar(id_contacto, req.body);
            if(!contactoActualizado){
                res.status(404).json({error:"Contacto no encontrado"});
                return;
            }

            res.json(contactoActualizado);

        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Error al actualizar contacto"});
        }
    },

    async eliminar(req:Request, res:Response){
        try {
            const id_contacto = Number(req.params.id);
            if(Number.isNaN(id_contacto)){
                res.status(400).json({error: "El ID de contacto debe ser un número válido"});
                return;
            }

            const contactoEliminado = await contactoService.eliminar(id_contacto);
            if(!contactoEliminado){
                res.status(404).json({error:"Contacto no encontrado"});
                return;
            }

            res.status(204).json(contactoEliminado);

        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Error al eliminar el contacto"});
        }
    },
};