import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Contacto, CrearContactoInput } from "../models/contacto.model";

@Injectable({
  providedIn: "root",
})
export class ContactoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  crear(id_paciente: number, data: CrearContactoInput): Observable<Contacto> {
    return this.http.post<Contacto>(`${this.apiUrl}/pacientes/${id_paciente}/contactos`, data);
  }

  eliminar(id_contacto: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contactos/${id_contacto}`);
  }
}