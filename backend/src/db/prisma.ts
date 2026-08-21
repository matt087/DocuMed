import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

let prismaInstancia: PrismaClient | null = null;

export function inicializarPrisma(databaseUrl: string): PrismaClient {
  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl,
  });

  prismaInstancia = new PrismaClient({
    adapter,
  });

  return prismaInstancia;
}

export function obtenerPrisma(): PrismaClient {
  if (!prismaInstancia) {
    throw new Error(
      "Prisma no ha sido inicializado. Llama a inicializarPrisma() primero."
    );
  }

  return prismaInstancia;
}