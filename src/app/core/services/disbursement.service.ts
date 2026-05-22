import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DisbursementRequest, DisbursementResponse,
  PaymentRequest, PaymentResponse
} from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class DisbursementService {
  private readonly disbUrl = `${environment.apiUrl}/disbursements`;
  private readonly payUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // ── Disbursement endpoints ──
  createDisbursement(request: DisbursementRequest): Observable<DisbursementResponse> {
    return this.http.post<DisbursementResponse>(this.disbUrl, request);
  }

  getDisbursementById(id: number): Observable<DisbursementResponse> {
    return this.http.get<DisbursementResponse>(`${this.disbUrl}/${id}`);
  }

  getDisbursementsByApplication(applicationId: number): Observable<DisbursementResponse[]> {
    return this.http.get<DisbursementResponse[]>(`${this.disbUrl}/application/${applicationId}`);
  }

  getAllDisbursements(): Observable<DisbursementResponse[]> {
    return this.http.get<DisbursementResponse[]>(this.disbUrl);
  }

  updateDisbursementStatus(id: number, status: string): Observable<DisbursementResponse> {
    return this.http.patch<DisbursementResponse>(`${this.disbUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  // ── Payment endpoints ──
  createPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.payUrl, request);
  }

  getPaymentById(id: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.payUrl}/${id}`);
  }

  getPaymentsByDisbursement(disbursementId: number): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.payUrl}/disbursement/${disbursementId}`);
  }
}
