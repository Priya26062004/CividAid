import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationResponse } from '../../../core/models/application.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.css'
})
export class NotificationListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroy$ = new Subject<void>();

  notifications: NotificationResponse[] = [];
  loading = true;
  unreadCount = 0;
  filter: 'ALL' | 'READ' | 'UNREAD' = 'ALL';

  get filteredNotifications(): NotificationResponse[] {
    if (this.filter === 'ALL') {
      return this.notifications;
    }
    return this.notifications.filter(n => n.status === this.filter);
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationService.notificationRefresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadNotifications());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.fetchNotifications(userId);
      return;
    }

    const email = this.authService.getCurrentUser()?.email;
    if (!email) {
      this.loading = false;
      return;
    }

    this.userService.getAllUsers().subscribe({
      next: users => {
        const match = users.find(u => u.email === email);
        if (match?.userId) {
          this.authService.setUserId(match.userId);
          this.fetchNotifications(match.userId);
        } else {
          this.loading = false;
        }
      },
      error: () => this.loading = false
    });
  }

  private fetchNotifications(userId: number): void {
    this.notificationService.getNotificationsByUser(userId)
      .pipe(tap(notifs => console.log('Fetched notifications:', notifs)))
      .subscribe({
        next: notifs => {
          this.notifications = notifs.sort((a, b) =>
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
          this.unreadCount = notifs.filter(n => n.status === 'UNREAD').length;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  markRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: updated => {
        const idx = this.notifications.findIndex(n => n.notificationId === id);
        if (idx >= 0) this.notifications[idx] = updated;
        this.unreadCount = this.notifications.filter(n => n.status === 'UNREAD').length;
      }
    });
  }

  setFilter(filter: 'ALL' | 'READ' | 'UNREAD'): void {
    this.filter = filter;
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      APPLICATION: 'badge-primary', DISBURSEMENT: 'badge-success',
      PAYMENT: 'badge-success', COMPLIANCE: 'badge-warning',
      PROGRAM: 'badge-info', GENERAL: 'badge-neutral'
    };
    return map[category] || 'badge-neutral';
  }
}
