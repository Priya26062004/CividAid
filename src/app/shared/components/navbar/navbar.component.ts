import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  unreadCount = 0;

  get userInitial(): string {
    const email = this.authService.getCurrentUser()?.email;
    return email ? email.charAt(0).toUpperCase() : '?';
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadUnreadCount();
      this.notificationService.notificationRefresh$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadUnreadCount());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUnreadCount(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.fetchUnread(userId);
      return;
    }

    const email = this.authService.getCurrentUser()?.email;
    if (!email) {
      this.unreadCount = 0;
      return;
    }

    this.userService.getAllUsers().subscribe({
      next: users => {
        const match = users.find(u => u.email === email);
        if (match?.userId) {
          this.authService.setUserId(match.userId);
          this.fetchUnread(match.userId);
        } else {
          this.unreadCount = 0;
        }
      },
      error: () => this.unreadCount = 0
    });
  }

  private fetchUnread(userId: number): void {
    this.notificationService.getUnreadNotifications(userId).subscribe({
      next: (notifs) => this.unreadCount = notifs.length,
      error: () => this.unreadCount = 0
    });
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  logout(): void {
    this.authService.logout();
  }
}
