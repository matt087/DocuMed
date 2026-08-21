import { obtenerPrisma } from "../db/prisma";

export type CrearAntecedenteInput = {
    tipo: string,
    descripcion: string,
};

export type ActualizarAntecedenteInput = Partial<CrearAntecedenteInput>;

const TIPOS_VALIDOS = ["Personal", "Familiar", "GO"];

export const antecedenteService = ({
    async listarPorPaciente(id_paciente: number){
        const prisma = obtenerPrisma();
        return prisma.antecedente.findMany({
            where: {id_paciente, deleted_at: null},
            orderBy: {tipo: "asc"},
        })
    },

    async buscarPorId(id_antecedentes: number){
        const prisma = obtenerPrisma();
        return prisma.antecedente.findFirst({
            where: ({id_antecedentes, deleted_at: null}),
        })
    },

    async crear(id_paciente: number, data: CrearAntecedenteInput){
        const prisma = obtenerPrisma();
        const paciente = await prisma.paciente.findFirst({
            where: ({id_paciente, deleted_at: null})
        });

        if(!paciente) return null;

        return prisma.antecedente.create({
            data: ({...data, id_paciente})
        });
    },

    async actualizar(id_antecedentes: number, data: ActualizarAntecedenteInput){
        const prisma = obtenerPrisma();
        const antecedente = await prisma.antecedente.findFirst({
            where: ({id_antecedentes, deleted_at: null}),
        });

        if (!antecedente) return null;

        return prisma.antecedente.update({
            where:{id_antecedentes},
            data,
        });
    },

    async eliminar(id_antecedentes: number){
        const prisma = obtenerPrisma();
        const antecedente = await prisma.antecedente.findFirst({
            where: {id_antecedentes, deleted_at: null},
        });

        if(!antecedente) return null;

        return prisma.antecedente.update({
            where: {id_antecedentes},
            data: {deleted_at: new Date()},
        });
    },

    esTipoValido(tipo: string) {
        return TIPOS_VALIDOS.includes(tipo);
    },

});