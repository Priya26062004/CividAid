import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CitizenRequest, CitizenResponse, DocumentUploadRequest, DocumentResponse } from '../models/citizen.model';

@Injectable({ providedIn: 'root' })
export class CitizenService {
  private readonly citizenUrl = `${environment.apiUrl}/citizens`;
  private readonly documentUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  // ── Citizen endpoints ──
  getCitizenById(id: number): Observable<CitizenResponse> {
    return this.http.get<CitizenResponse>(`${this.citizenUrl}/${id}`);
  }

  getCitizenByUserId(userId: number): Observable<CitizenResponse> {
    return this.http.get<CitizenResponse>(`${this.citizenUrl}/user/${userId}`);
  }

  createCitizen(request: CitizenRequest): Observable<CitizenResponse> {
    return this.http.post<CitizenResponse>(`${this.citizenUrl}/register`, request);
  }

  getAllCitizens(): Observable<CitizenResponse[]> {
    return this.http.get<CitizenResponse[]>(this.citizenUrl);
  }

  updateCitizen(id: number, request: CitizenRequest): Observable<CitizenResponse> {
    return this.http.put<CitizenResponse>(`${this.citizenUrl}/${id}`, request);
  }

  deleteCitizen(id: number): Observable<string> {
    return this.http.delete(`${this.citizenUrl}/${id}`, { responseType: 'text' });
  }

  // ── Document endpoints ──
  uploadDocument(request: DocumentUploadRequest): Observable<DocumentResponse> {
    const formData = new FormData();
    formData.append('citizenId', request.citizenId.toString());
    formData.append('docType', request.docType);
    formData.append('file', request.file);
    return this.http.post<DocumentResponse>(this.documentUrl, formData);
  }

  getDocumentById(id: number): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.documentUrl}/${id}`);
  }

  getDocumentsByCitizen(citizenId: number): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.documentUrl}/citizen/${citizenId}`);
  }

  verifyDocument(id: number, status: string): Observable<DocumentResponse> {
    return this.http.patch<DocumentResponse>(`${this.documentUrl}/${id}/verify`, null, {
      params: { status }
    });
  }

  downloadDocument(id: number): string {
    return `${this.documentUrl}/${id}/download`;
  }
}
