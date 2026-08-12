import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Paciente, CrearPacienteInput, ActualizarPacienteInput } from "../models/paciente.model";

@Injectable({
  providedIn: "root",
})
export class PacienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/pacientes`;

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.baseUrl);
  }

  buscarPorId(id_paciente: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/${id_paciente}`);
  }

  crear(data: CrearPacienteInput): Observable<Paciente> {
    return this.http.post<Paciente>(this.baseUrl, data);
  }

  actualizar(id_paciente: number, data: ActualizarPacienteInput): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.baseUrl}/${id_paciente}`, data);
  }

  eliminar(id_paciente: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id_paciente}`);
  }
}