import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Consulta, CrearConsultaInput, ActualizarConsultaInput } from "../models/consulta.model";

@Injectable({
  providedIn: "root",
})
export class ConsultaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/consultas`;

  listar(desde?: string, hasta?: string): Observable<Consulta[]> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;

    return this.http.get<Consulta[]>(this.baseUrl, { params });
  }

  listarPorPaciente(id_paciente: number): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${environment.apiUrl}/pacientes/${id_paciente}/consultas`);
  }

  buscarPorId(id_consulta: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.baseUrl}/${id_consulta}`);
  }

  crear(id_paciente: number, data: CrearConsultaInput): Observable<Consulta> {
    return this.http.post<Consulta>(`${environment.apiUrl}/pacientes/${id_paciente}/consultas`, data);
  }

  actualizar(id_consulta: number, data: ActualizarConsultaInput): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.baseUrl}/${id_consulta}`, data);
  }

  eliminar(id_consulta: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id_consulta}`);
  }
}