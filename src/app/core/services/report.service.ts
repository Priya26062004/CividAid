import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReportRequest, ReportResponse } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  generateReport(request: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(this.apiUrl, request);
  }

  getReportById(id: number): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/${id}`);
  }

  getAllReports(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(this.apiUrl);
  }

  getReportsByScope(scope: string): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/scope/${scope}`);
  }
}
