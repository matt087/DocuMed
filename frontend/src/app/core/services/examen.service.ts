import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Examen, CrearExamenInput } from "../models/examen.model";

@Injectable({ providedIn: "root" })
export class ExamenService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/examenes`;

  crear(id_consulta: number, archivo: File): Observable<Examen> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<Examen>(`${environment.apiUrl}/consultas/${id_consulta}/examenes`, formData);
  }

  eliminar(id_examen: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id_examen}`);
  }

  obtenerUrlArchivo(id_examen: number): string {
    return `${this.baseUrl}/${id_examen}/archivo`;
  }
}