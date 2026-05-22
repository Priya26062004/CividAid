import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProgramRequest, ProgramResponse, ProgramStatus,
  SchemeRequest, SchemeResponse,
  SchemeStatus, PageResponse
} from '../models/program.model';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private readonly programUrl = `${environment.apiUrl}/programs`;
  private readonly schemeUrl = `${environment.apiUrl}/schemes`;

  constructor(private http: HttpClient) {}

  // ════════════════════════════════════════
  //  Program endpoints (reworked for new backend)
  // ════════════════════════════════════════

  /** POST /programs */
  createProgram(request: ProgramRequest): Observable<ProgramResponse> {
    return this.http.post<ProgramResponse>(this.programUrl, request);
  }

  /** GET /programs/{id} */
  getProgramById(id: number): Observable<ProgramResponse> {
    return this.http.get<ProgramResponse>(`${this.programUrl}/${id}`);
  }

  /**
   * GET /programs?page&size&status&search
   * New backend returns Page<ProgramResponseDto>.
   * This convenience method extracts .content for components that don't need pagination.
   */
  getAllPrograms(page = 0, size = 100): Observable<ProgramResponse[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ProgramResponse>>(this.programUrl, { params })
      .pipe(map(p => p.content));
  }

  /** GET /programs?page&size — returns full Page wrapper for pagination */
  getProgramsPaged(page = 0, size = 20): Observable<PageResponse<ProgramResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ProgramResponse>>(this.programUrl, { params });
  }

  /** GET /programs?status=ACTIVE&page&size */
  getProgramsByStatus(status: ProgramStatus, page = 0, size = 20): Observable<PageResponse<ProgramResponse>> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ProgramResponse>>(this.programUrl, { params });
  }

  /** GET /programs?search=keyword&page&size */
  searchPrograms(keyword: string, page = 0, size = 20): Observable<PageResponse<ProgramResponse>> {
    const params = new HttpParams()
      .set('search', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ProgramResponse>>(this.programUrl, { params });
  }

  /** PUT /programs/{id} */
  updateProgram(id: number, request: ProgramRequest): Observable<ProgramResponse> {
    return this.http.put<ProgramResponse>(`${this.programUrl}/${id}`, request);
  }

  /** PATCH /programs/{id}/status?status=ACTIVE */
  updateProgramStatus(id: number, status: ProgramStatus): Observable<string> {
    return this.http.patch(`${this.programUrl}/${id}/status`, null, {
      params: { status },
      responseType: 'text'
    });
  }

  /** DELETE /programs/{id} */
  deleteProgram(id: number): Observable<string> {
    return this.http.delete(`${this.programUrl}/${id}`, { responseType: 'text' });
  }

  // ════════════════════════════════════════
  //  Scheme endpoints
  // ════════════════════════════════════════

  /** POST /schemes */
  createScheme(request: SchemeRequest): Observable<SchemeResponse> {
    return this.http.post<SchemeResponse>(this.schemeUrl, request);
  }

  /** GET /schemes/{id} */
  getSchemeById(id: number): Observable<SchemeResponse> {
    return this.http.get<SchemeResponse>(`${this.schemeUrl}/${id}`);
  }

  /**
   * GET /schemes?page=0&size=100
   * Backend returns Page<SchemeResponseDto>. We extract .content for convenience.
   */
  getAllSchemes(page = 0, size = 100): Observable<SchemeResponse[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<SchemeResponse>>(this.schemeUrl, { params })
      .pipe(map(page => page.content));
  }

  /** GET /schemes?page&size — returns full Page wrapper */
  getSchemesPaged(page = 0, size = 20): Observable<PageResponse<SchemeResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<SchemeResponse>>(this.schemeUrl, { params });
  }

  /** GET /schemes/program/{programId} */
  getSchemesByProgram(programId: number): Observable<SchemeResponse[]> {
    return this.http.get<SchemeResponse[] | PageResponse<SchemeResponse>>(`${this.schemeUrl}/program/${programId}`)
      .pipe(map(response => Array.isArray(response) ? response : response.content));
  }

  /** PUT /schemes/{id} */
  updateScheme(id: number, request: SchemeRequest): Observable<SchemeResponse> {
    return this.http.put<SchemeResponse>(`${this.schemeUrl}/${id}`, request);
  }

  /** PATCH /schemes/{id}/status?status=ACTIVE */
  updateSchemeStatus(id: number, status: SchemeStatus): Observable<string> {
    return this.http.patch(`${this.schemeUrl}/${id}/status`, null, {
      params: { status },
      responseType: 'text'
    });
  }

  /** DELETE /schemes/{id} */
  deleteScheme(id: number): Observable<string> {
    return this.http.delete(`${this.schemeUrl}/${id}`, { responseType: 'text' });
  }
}
