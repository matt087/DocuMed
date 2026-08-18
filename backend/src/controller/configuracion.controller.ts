import { Request, Response } from "express";
import { almacenamientoService } from "../services/almacenamiento.service";
import { respaldoService } from "../services/respaldo.service";

export const configuracionController = {
  async obtenerAlmacenamiento(_req: Request, res: Response) {
    try {
      const info = await almacenamientoService.obtenerInfo();
      res.json(info);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener información de almacenamiento" });
    }
  },

  async cambiarAlmacenamiento(req: Request, res: Response) {
    try {
      const { ruta } = req.body;

      if (!ruta || typeof ruta !== "string") {
        res.status(400).json({ error: "Debes indicar una ruta válida" });
        return;
      }

      const resultado = await almacenamientoService.cambiarRuta(ruta);
      res.json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Error al cambiar la ubicación" });
    }
  },

  async generarRespaldo(_req: Request, res: Response) {
    try {
      const { rutaZip, nombreArchivo } = await respaldoService.generar();

      res.download(rutaZip, nombreArchivo, (error) => {
        if (error) {
          console.error("Error al enviar el archivo:", error);
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Error al generar el respaldo",
      });
    }
  },
};