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

  contactos?: Contacto[];
  antecedentes?: Antecedente[];
}

export interface Contacto {
  id_contacto: number;
  nombres: string;
  relacion: string;
  telefono: string;
}

export interface Antecedente {
  id_antecedentes: number;
  tipo: "Personal" | "Familiar" | "GO";
  descripcion: string;
}

export type CrearPacienteInput = Omit<
  Paciente,
  "id_paciente" | "created_at" | "updated_at" | "deleted_at" | "contactos" | "antecedentes"
>;

export type ActualizarPacienteInput = Partial<CrearPacienteInput>;