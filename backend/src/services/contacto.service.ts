import { obtenerPrisma } from "../db/prisma";

export type crearContactoInput = {
    nombres: string;
    relacion: string;
    telefono: string;
};

export type ActualizarContactoInput = Partial<crearContactoInput>;

export const contactoService = ({
    async listarPorPaciente(id_paciente: number){
        const prisma = obtenerPrisma();
        return prisma.contacto.findMany({
            where: {id_paciente, deleted_at: null},
            orderBy: {nombres: "asc"},
        });
    },

    async buscarPorId(id_contacto: number){
        const prisma = obtenerPrisma();
        return prisma.contacto.findFirst({
            where: {id_contacto, deleted_at: null},
        });
    },

    async crear(id_paciente: number, data: crearContactoInput){
        const prisma = obtenerPrisma();
        const paciente = await prisma.paciente.findFirst({
            where: {id_paciente, deleted_at: null},
        });

        if(!paciente) return null;

        return prisma.contacto.create({
            data: {...data, id_paciente}
        });
    },

    async actualizar(id_contacto: number, data: ActualizarContactoInput){
        const prisma = obtenerPrisma();
        const contacto = await prisma.contacto.findFirst({
            where: {id_contacto, deleted_at: null}
        });

        if (!contacto) return null;

        return prisma.contacto.update({
            where: {id_contacto},
            data,
        });
    },

    async eliminar(id_contacto: number){
        const prisma = obtenerPrisma();
        const contacto = await prisma.contacto.findFirst({
            where: {id_contacto, deleted_at: null}
        });

        if(!contacto) return null;

        return prisma.contacto.update({
            where:{id_contacto},
            data: {deleted_at: new Date()},
        });
    },
});