export function obtenerCarpetaDatos(): string {
  const rutaElectron = process.env.DOCUMED_DATOS_DIR;
  if (rutaElectron) {
    return rutaElectron;
  }
  return process.cwd();
}