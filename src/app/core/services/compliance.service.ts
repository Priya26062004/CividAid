import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ComplianceRecordRequest, ComplianceRecordResponse,
  AuditRequest, AuditResponse
} from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private readonly compUrl = `${environment.apiUrl}/compliance`;
  private readonly auditUrl = `${environment.apiUrl}/audits`;

  constructor(private http: HttpClient) {}

  // ── Compliance endpoints ──
  createComplianceRecord(request: ComplianceRecordRequest): Observable<ComplianceRecordResponse> {
    return this.http.post<ComplianceRecordResponse>(this.compUrl, request);
  }

  getComplianceRecordById(id: number): Observable<ComplianceRecordResponse> {
    return this.http.get<ComplianceRecordResponse>(`${this.compUrl}/${id}`);
  }

  getAllComplianceRecords(): Observable<ComplianceRecordResponse[]> {
    return this.http.get<ComplianceRecordResponse[]>(this.compUrl);
  }

  getComplianceRecordsByEntity(entityId: number): Observable<ComplianceRecordResponse[]> {
    return this.http.get<ComplianceRecordResponse[]>(`${this.compUrl}/entity/${entityId}`);
  }

  // ── Audit endpoints ──
  createAudit(request: AuditRequest): Observable<AuditResponse> {
    return this.http.post<AuditResponse>(this.auditUrl, request);
  }

  getAuditById(id: number): Observable<AuditResponse> {
    return this.http.get<AuditResponse>(`${this.auditUrl}/${id}`);
  }

  getAllAudits(): Observable<AuditResponse[]> {
    return this.http.get<AuditResponse[]>(this.auditUrl);
  }

  updateAuditStatus(id: number, status: string): Observable<AuditResponse> {
    return this.http.patch<AuditResponse>(`${this.auditUrl}/${id}/status`, null, {
      params: { status }
    });
  }
}
