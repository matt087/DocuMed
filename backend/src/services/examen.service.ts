import { prisma } from "../db/prisma";

export type CrearExamenInput = {
    ruta_archivo: string;
    fecha: Date;
};

export type ActualizarExamenInput = Partial<CrearExamenInput>;

export const examenService = {

    async listarPorConsulta(id_consulta: number) {
        return prisma.examen.findMany({
            where: { id_consulta, deleted_at: null },
            orderBy: { created_at: "asc" },
        });
    },

    async buscarPorId(id_examen: number) {
        return prisma.examen.findFirst({
            where: { id_examen, deleted_at: null },
        });
    },

    async crear(id_consulta: number, data: CrearExamenInput) {
        const consulta = await prisma.consulta.findFirst({
            where: { id_consulta, deleted_at: null },
        });

        if (!consulta) return null;

        return prisma.examen.create({
            data: { ...data, id_consulta },
        });
    },

    async actualizar(id_examen: number, data: ActualizarExamenInput) {
        const existente = await prisma.examen.findFirst({
            where: { id_examen, deleted_at: null },
        });

        if (!existente) return null;

        return prisma.examen.update({
            where: { id_examen },
            data,
        });
    },

    async eliminar(id_examen: number) {
        const existente = await prisma.examen.findFirst({
            where: { id_examen, deleted_at: null },
        });

        if (!existente) return null;

        return prisma.examen.update({
            where: { id_examen },
            data: { deleted_at: new Date() },
        });
    },
};