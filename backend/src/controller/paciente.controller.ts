import { Request, Response } from "express";
import { pacienteService } from "../services/paciente.service";

export const pacienteController = {
    async listar(_req: Request, res: Response){
        try{
            const pacientes = await pacienteService.listar();
            res.json(pacientes);
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Error al listar pacientes"});
        }
    },

    async buscarPorId(req: Request, res: Response){
        try{
            const id_paciente = Number(req.params.id);
            if(Number.isNaN(id_paciente)) {
                res.status(400).json({error: "El id debe ser un número válido"});
                return;
            }

            const paciente = await pacienteService.buscarPorId(id_paciente);
            if(!paciente){
                res.status(400).json({error: "Paciente no encontrado"});
                return;
            }

            res.json(paciente);
        }
        catch (error){
            console.error(error);
            res.status(500).json({error: "Error al buscar el paciente"});
        }
    },

    async crear(req: Request, res: Response){
        try{
            const {
                nombres, apellidos, fecha_nacimiento, sexo, direccion, telefono, 
                lugar_nacimiento } = req.body;

            if(!nombres || !apellidos || !fecha_nacimiento || !sexo  
                || !direccion || !telefono || !lugar_nacimiento){
                res.status(400).json({error: "Faltan campos obligatorios"});
                return;
            }

            const nuevoPaciente = await pacienteService.crear({
                ...req.body,
                fecha_nacimiento: new Date(fecha_nacimiento)
            });

            res.status(201).json(nuevoPaciente);
        }
        catch (error){
            console.error(error);
            res.status(500).json({error: "Error al crear el paciente"});
        }
    },

    async actualizar (req: Request, res: Response){
        try{
            const id_paciente = Number(req.params.id);
            if(Number.isNaN(id_paciente)){
                res.status(400).json({error: "El id debe ser un número válido"});
            }
            
            const datosActualizados = {...req.body};
            
            if(datosActualizados.fecha_nacimiento){
                datosActualizados.fecha_nacimiento = new Date(datosActualizados.fecha_nacimiento);
            }

            if(datosActualizados.fecha_primera_consulta){
                datosActualizados.fecha_primera_consulta = new Date(datosActualizados.fecha_primera_consulta);
            }

            const pacienteActualizado = await pacienteService.actualizar(id_paciente, datosActualizados);
            if(!pacienteActualizado){
                res.status(404).json({error: "Paciente no encontrado"});
                return;
            }

            res.json(pacienteActualizado);
        }
        catch(error){
            console.error(error);
            res.status(500).json({error: "Error al actualizar paciente"});
        }
    }, 

    async eliminar(req: Request, res: Response){
        try{
            const id_paciente = Number(req.params.id);
            if(Number.isNaN(id_paciente)){
                res.status(400).json({error: "El id debe ser un número válido"});
                return;
            }

            const pacienteEliminado = await pacienteService.eliminar(id_paciente);

            if(!pacienteEliminado){
                res.status(404).json({error: "Paciente no encontrado"});
                return;
            }

            res.status(204).send();
        }
        catch (error){
            console.error(error);
        }
    }
};