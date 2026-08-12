export interface Paciente {
  id_paciente: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: "M" | "F";
  cedula?: string | null;
  direccion: string;
  telefono: string;
  fecha_primera_consulta: string;
  lugar_nacimiento: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type CrearPacienteInput = Omit<
  Paciente,
  "id_paciente" | "created_at" | "updated_at" | "deleted_at"
>;

export type ActualizarPacienteInput = Partial<CrearPacienteInput>;