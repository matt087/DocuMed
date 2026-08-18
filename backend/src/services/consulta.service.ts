import { obtenerPrisma } from "../db/prisma";

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

export type ActualizarConsultaInput = Partial<CrearConsultaInput>;

export const consultaService = {
    async listar(desde?: string, hasta?: string) {
        const prisma = obtenerPrisma();
        const where: Record<string, unknown> = { deleted_at: null };

        if (desde || hasta) {
            const filtroFecha: Record<string, Date> = {};
            if (desde) filtroFecha.gte = new Date(`${desde}T00:00:00.000Z`);
            if (hasta) filtroFecha.lte = new Date(`${hasta}T23:59:59.999Z`);
            where.fecha = filtroFecha;
        }

        return prisma.consulta.findMany({
            where,
            include: {
                paciente: {
                    select: { id_paciente: true, nombres: true, apellidos: true },
                },
            },
            orderBy: { fecha: "desc" },
        });
    },
    async listarPorPaciente(id_paciente: number) {
        const prisma = obtenerPrisma();
        return prisma.consulta.findMany({
            where: { id_paciente, deleted_at: null },
            orderBy: { fecha: "desc" },
        });
    },

    async buscarPorId(id_consulta: number) {
        const prisma = obtenerPrisma();
        return prisma.consulta.findFirst({
            where: { id_consulta, deleted_at: null },
            include: {
                indicaciones: { where: { deleted_at: null } },
                examenes: { where: { deleted_at: null } },
            },
        });
    },

    async crear(id_paciente: number, data: CrearConsultaInput) {
        const prisma = obtenerPrisma();
        const paciente = await prisma.paciente.findFirst({
            where: { id_paciente, deleted_at: null },
        });

        if (!paciente) return null;

        const nuevaConsulta = await prisma.consulta.create({
            data: { ...data, id_paciente },
        });

        if (!paciente.fecha_primera_consulta) {
            await prisma.paciente.update({
                where: { id_paciente },
                data: { fecha_primera_consulta: new Date() },
            });
        }

        return nuevaConsulta;
    },

    async actualizar(id_consulta: number, data: ActualizarConsultaInput) {
        const prisma = obtenerPrisma();
        const existente = await prisma.consulta.findFirst({
            where: { id_consulta, deleted_at: null },
        });

        if (!existente) return null;

        return prisma.consulta.update({
            where: { id_consulta },
            data,
        });
    },

    async eliminar(id_consulta: number) {
        const prisma = obtenerPrisma();
        const existente = await prisma.consulta.findFirst({
            where: { id_consulta, deleted_at: null },
        });

        if (!existente) return null;

        return prisma.consulta.update({
            where: { id_consulta },
            data: { deleted_at: new Date(), }
        });
    },
};