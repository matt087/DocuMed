export interface Examen {
  id_examen: number;
  id_consulta: number;
  ruta_archivo: string;
  fecha: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type CrearExamenInput = Pick<Examen, 'ruta_archivo' | 'fecha'>;