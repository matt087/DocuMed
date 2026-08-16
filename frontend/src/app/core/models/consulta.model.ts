import { Indicacion } from './indicacion.model';
import { Examen } from './examen.model';

export interface Consulta {
  id_consulta: number;
  id_paciente: number;
  fecha: string;
  peso: number;
  talla: number;
  presion_sistolica: number;
  presion_diastolica: number;
  temperatura: number;
  perimetro_cefalico?: number | null;
  motivo_consulta: string;
  enfermedad_actual: string;
  examen_fisico: string;
  diagnostico: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  paciente?: {
    id_paciente: number;
    nombres: string;
    apellidos: string;
  };

  indicaciones?: Indicacion[];
  examenes?: Examen[];
}

export type CrearConsultaInput = Omit<
  Consulta,
  "id_consulta" | "id_paciente" | "created_at" | "updated_at" | "deleted_at" | "paciente"
>;

export type ActualizarConsultaInput = Partial<CrearConsultaInput>;