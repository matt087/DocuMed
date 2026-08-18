import {obtenerPrisma } from "../db/prisma";

export type CrearIndicacionInput = {
    indicacion: string;
};

export type ActualizarIndicacionInput = Partial<CrearIndicacionInput>;

export const indicacionService = {

    async listarPorConsulta(id_consulta: number) {
        const prisma = obtenerPrisma();
        return prisma.indicacion.findMany({
            where: { id_consulta, deleted_at: null },
            orderBy: { created_at: "asc" },
        });
    },

    async buscarPorId(id_indicacion: number) {
        const prisma = obtenerPrisma();
        return prisma.indicacion.findFirst({
            where: { id_indicacion, deleted_at: null },
        });
    },

    async crear(id_consulta: number, data: CrearIndicacionInput) {
        const prisma = obtenerPrisma();
        const consulta = await prisma.consulta.findFirst({
            where: { id_consulta, deleted_at: null },
        });

        if (!consulta) return null;

        return prisma.indicacion.create({
            data: { ...data, id_consulta },
        });
    },

    async actualizar(id_indicacion: number, data: ActualizarIndicacionInput) {
        const prisma = obtenerPrisma();
        const existente = await prisma.indicacion.findFirst({
            where: { id_indicacion, deleted_at: null },
        });

        if (!existente) return null;

        return prisma.indicacion.update({
            where: { id_indicacion },
            data,
        });
    },

    async eliminar(id_indicacion: number) {
        const prisma = obtenerPrisma();
        const existente = await prisma.indicacion.findFirst({
            where: { id_indicacion, deleted_at: null },
        });

        if (!existente) return null;

        return prisma.indicacion.update({
            where: { id_indicacion },
            data: { deleted_at: new Date() },
        });
    },
};