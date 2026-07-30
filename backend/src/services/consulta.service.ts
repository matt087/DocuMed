import {prisma} from "../db/prisma";

export type CrearConsultaInput = {
    fecha: Date;
    peso: number;
    talla: number;
    presion_sistolica: number;
    presion_diastolica: number;
    temperatura: number;
    perimetro_cefalico: number;
    motivo_consulta: string;
    enfermedad_actual: string;
    examen_fisico: string;
    diagnostico: string;
};

export type ActualizarConsultaInput = Partial <CrearConsultaInput>;

export const consultaService = {

    async listarPorPaciente(id_paciente:number){
        return prisma.consulta.findMany({
            where: {id_paciente, deleted_at:null},
            orderBy: {fecha: "desc"},
        });
    },

    async buscarPorId(id_consulta: number){
        return prisma.consulta.findFirst({
            where: {id_consulta, deleted_at:null},
            include: {
                indicaciones: {where: {deleted_at: null}},
                examenes: {where: {deleted_at: null}},
            },
        });
    },

    async crear(id_paciente: number, data: CrearConsultaInput){
        const paciente = await prisma.paciente.findFirst({
            where: {id_paciente, deleted_at:null},
        });

        if(!paciente) return null;
        
        return prisma.consulta.create({
            data:{...data, id_paciente},
        });
    },

    async actualizar(id_consulta:number, data: ActualizarConsultaInput){
        const existente = await prisma.consulta.findFirst({
            where:{ id_consulta, deleted_at: null},
        });
        
        if(!existente) return null;

        return prisma.consulta.update({
            where: {id_consulta},
            data,
        });
    },

    async eliminar(id_consulta: number){
        const existente = await prisma.consulta.findFirst({
            where:{ id_consulta, deleted_at: null},
        });
        
        if(!existente) return null;

        return prisma.consulta.update({
            where:{id_consulta},
            data: {deleted_at: new Date(),}
        });
    },
};