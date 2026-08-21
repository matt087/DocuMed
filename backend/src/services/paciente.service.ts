import {obtenerPrisma } from "../db/prisma";

export type CrearPacienteInput = {
    nombres: string;
    apellidos: string;
    fecha_nacimiento: Date;
    sexo: string;
    cedula: string;
    direccion: string;
    telefono: string;
    fecha_primera_consulta?: Date;
    lugar_nacimiento: string;
};

export type ActualizarPacienteInput = Partial<CrearPacienteInput>;

export const pacienteService = {
    async listar(){
        const prisma = obtenerPrisma();
        return prisma.paciente.findMany({
            where: {deleted_at: null},
            orderBy: {apellidos: "asc"}
        });
    },

    async buscarPorId(id_paciente: number){
        const prisma = obtenerPrisma();
        return prisma.paciente.findFirst({
            where: {id_paciente, deleted_at: null},
            include: {
                contactos: {where: {deleted_at:null}},
                antecedentes: {where: {deleted_at:null}},   
            }
        });
    },

    async crear(data: CrearPacienteInput){
        const prisma = obtenerPrisma();
        return prisma.paciente.create({data});
    },

    async actualizar(id_paciente: number, data: ActualizarPacienteInput){
        const prisma = obtenerPrisma();
        const existe = await prisma.paciente.findFirst({
            where: {id_paciente, deleted_at: null},
        });

        if(!existe) return null;

        return prisma.paciente.update({
            where: {id_paciente},
            data,
        });
    },

    async eliminar(id_paciente: number){
        const prisma = obtenerPrisma();     
        const existe = await prisma.paciente.findFirst({
            where: {id_paciente, deleted_at: null},
        });

        if (!existe) return null;

        return prisma.paciente.update({
            where: {id_paciente},
            data: { deleted_at: new Date()},
        });
    },
};