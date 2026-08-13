import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Antecedente, CrearAntecedenteInput } from "../models/antecedente.model";

@Injectable({
  providedIn: "root",
})
export class AntecedenteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  crear(id_paciente: number, data: CrearAntecedenteInput): Observable<Antecedente> {
    return this.http.post<Antecedente>(`${this.apiUrl}/pacientes/${id_paciente}/antecedentes`, data);
  }

  eliminar(id_antecedentes: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/antecedentes/${id_antecedentes}`);
  }
}