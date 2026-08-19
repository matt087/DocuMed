import fs from "fs";
import path from "path";
import { obtenerCarpetaDatos } from "./rutas-datos";

const CONFIG_PATH = path.join(obtenerCarpetaDatos(), "config", "app-config.json");
const RUTA_DEFECTO = path.join(obtenerCarpetaDatos(), "uploads", "examenes");

interface AppConfig {
  rutaExamenes: string;
}

function asegurarArchivoConfig(): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(CONFIG_PATH)) {
    const configInicial: AppConfig = { rutaExamenes: RUTA_DEFECTO };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(configInicial, null, 2));
  }
}

export function obtenerRutaExamenes(): string {
  asegurarArchivoConfig();
  const contenido = fs.readFileSync(CONFIG_PATH, "utf-8");
  const config: AppConfig = JSON.parse(contenido);
  return config.rutaExamenes;
}

export function establecerRutaExamenes(nuevaRuta: string): void {
  asegurarArchivoConfig();
  const config: AppConfig = { rutaExamenes: nuevaRuta };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}