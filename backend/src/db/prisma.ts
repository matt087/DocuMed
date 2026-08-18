import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let prismaInstancia: PrismaClient | null = null;

export function inicializarPrisma(databaseUrl: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  prismaInstancia = new PrismaClient({ adapter });
  return prismaInstancia;
}

export function obtenerPrisma(): PrismaClient {
  if (!prismaInstancia) {
    throw new Error("Prisma no ha sido inicializado. Llama a inicializarPrisma() primero.");
  }
  return prismaInstancia;
}