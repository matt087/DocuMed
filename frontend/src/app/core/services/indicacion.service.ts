import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Indicacion, CrearIndicacionInput } from "../models/indicacion.model";

@Injectable({ providedIn: "root" })
export class IndicacionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/indicaciones`;

  crear(id_consulta: number, data: CrearIndicacionInput): Observable<Indicacion> {
    return this.http.post<Indicacion>(`${environment.apiUrl}/consultas/${id_consulta}/indicaciones`, data);
  }

  eliminar(id_indicacion: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id_indicacion}`);
  }
}