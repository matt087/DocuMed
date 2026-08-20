import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface InfoAlmacenamiento {
    ruta: string;
    cantidadArchivos: number;
    espacioUsadoBytes: number;
    archivosFaltantes: number;
    archivosHuerfanos: number;
}

@Injectable({ providedIn: "root" })
export class ConfiguracionService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/configuracion`;

    obtenerAlmacenamiento(): Observable<InfoAlmacenamiento> {
        return this.http.get<InfoAlmacenamiento>(`${this.baseUrl}/almacenamiento`);
    }

    cambiarAlmacenamiento(ruta: string): Observable<{ rutaAnterior: string; rutaNueva: string; archivosMovidos: number }> {
        return this.http.put<{ rutaAnterior: string; rutaNueva: string; archivosMovidos: number }>(
            `${this.baseUrl}/almacenamiento`,
            { ruta }
        );
    }

    generarRespaldo(): Observable<Blob> {
        return this.http.post(`${this.baseUrl}/respaldo`, {}, { responseType: 'blob' });
    }
    
    restaurarRespaldo(archivo: File): Observable<{ mensaje: string }> {
        const formData = new FormData();
        formData.append('archivo', archivo);
        return this.http.post<{ mensaje: string }>(`${this.baseUrl}/respaldo/restaurar`, formData);
    }
}