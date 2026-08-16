export interface Indicacion {
  id_indicacion: number;
  id_consulta: number;
  indicacion: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type CrearIndicacionInput = Pick<Indicacion, 'indicacion'>;