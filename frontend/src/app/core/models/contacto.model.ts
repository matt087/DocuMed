export interface Contacto {
  id_contacto: number;
  nombres: string;
  relacion: string;
  telefono: string;
}

export type CrearContactoInput = Omit<Contacto, "id_contacto">;