export interface Antecedente {
  id_antecedentes: number;
  tipo: "Personal" | "Familiar" | "GO";
  descripcion: string;
}

export type CrearAntecedenteInput = Omit<Antecedente, "id_antecedentes">;