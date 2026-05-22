import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApplicationRequest, ApplicationResponse,
  EligibilityCheckRequest, EligibilityCheckResponse
} from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly appUrl = `${environment.apiUrl}/applications`;
  private readonly eligUrl = `${environment.apiUrl}/eligibility-checks`;

  constructor(private http: HttpClient) {}

  // ── Application endpoints ──
  createApplication(request: ApplicationRequest): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.appUrl, request);
  }

  getApplicationById(id: number): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResponse>(`${this.appUrl}/${id}`);
  }

  getApplicationsByCitizen(citizenId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.appUrl}/citizen/${citizenId}`);
  }

  getAllApplications(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(this.appUrl);
  }

  updateApplicationStatus(id: number, status: string): Observable<ApplicationResponse> {
    return this.http.patch<ApplicationResponse>(`${this.appUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  // ── Eligibility Check endpoints ──
  createEligibilityCheck(request: EligibilityCheckRequest): Observable<EligibilityCheckResponse> {
    return this.http.post<EligibilityCheckResponse>(this.eligUrl, request);
  }

  getEligibilityCheckById(id: number): Observable<EligibilityCheckResponse> {
    return this.http.get<EligibilityCheckResponse>(`${this.eligUrl}/${id}`);
  }

  getEligibilityChecksByApplication(applicationId: number): Observable<EligibilityCheckResponse[]> {
    return this.http.get<EligibilityCheckResponse[]>(`${this.eligUrl}/application/${applicationId}`);
  }
}
