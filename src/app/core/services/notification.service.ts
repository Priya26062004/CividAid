import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationRequest, NotificationResponse } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.notificationApiUrl ?? environment.apiUrl}/notifications`;
  private readonly refreshSubject = new Subject<void>();
  public readonly notificationRefresh$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  triggerRefresh(): void {
    this.refreshSubject.next();
  }

  createNotification(request: NotificationRequest): Observable<NotificationResponse> {
    const headers = new HttpHeaders({ 'X-Internal-Service-Key': 'MySecretKey123' });
    return this.http.post<NotificationResponse>(`${this.apiUrl}/internal`, request, { headers }).pipe(
      tap(() => this.refreshSubject.next())
    );
  }

  getNotificationById(id: number): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}/${id}`);
  }

  getNotificationsByUser(userId: number): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUnreadNotifications(userId: number): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/user/${userId}/unread`);
  }

  markAsRead(id: number): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.apiUrl}/${id}/read`, null).pipe(
      tap(() => this.refreshSubject.next())
    );
  }
}

