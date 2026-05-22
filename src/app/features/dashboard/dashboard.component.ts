import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { CitizenService } from '../../core/services/citizen.service';
import { ApplicationService } from '../../core/services/application.service';
import { ProgramService } from '../../core/services/program.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/models/role.enum';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ApplicationResponse } from '../../core/models/application.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private citizenService = inject(CitizenService);
  private applicationService = inject(ApplicationService);
  private programService = inject(ProgramService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  loading = true;
  userEmail = '';
  userRole = '';
  stats = { totalUsers: 0, totalCitizens: 0, totalPrograms: 0, totalApplications: 0, unreadNotifications: 0 };
  recentApplications: ApplicationResponse[] = [];

  get isOfficer(): boolean {
    return this.authService.hasRole(
      Role.WELFARE_OFFICER, Role.PROGRAM_MANAGER, Role.ADMINISTRATOR,
      Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR
    );
  }
  get isCitizen(): boolean { return this.authService.hasRole(Role.CITIZEN); }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || '';
    this.userRole = user?.role || '';
    if (this.isOfficer) this.loadOfficerDashboard();
    else this.loadCitizenDashboard();
  }

  private loadOfficerDashboard(): void {
    let loaded = 0;
    const done = () => { if (++loaded >= 4) this.loading = false; };
    this.userService.getAllUsers().subscribe({ next: u => { this.stats.totalUsers = u.length; done(); }, error: done });
    this.citizenService.getAllCitizens().subscribe({ next: c => { this.stats.totalCitizens = c.length; done(); }, error: done });
    this.programService.getAllPrograms().subscribe({ next: p => { this.stats.totalPrograms = p.length; done(); }, error: done });
    this.applicationService.getAllApplications().subscribe({
      next: apps => { this.stats.totalApplications = apps.length; this.recentApplications = apps.slice(0, 5); done(); },
      error: done
    });
  }

  private loadCitizenDashboard(): void {
    let loaded = 0;
    const done = () => { if (++loaded >= 3) this.loading = false; };
    const userId = this.authService.getUserId();
    this.programService.getAllPrograms().subscribe({ next: p => { this.stats.totalPrograms = p.length; done(); }, error: done });
    if (userId) {
      this.citizenService.getCitizenByUserId(userId).subscribe({
        next: citizen => {
          this.authService.setCitizenId(citizen.citizenId);
          this.applicationService.getApplicationsByCitizen(citizen.citizenId).subscribe({
            next: apps => { this.stats.totalApplications = apps.length; done(); }, error: done
          });
        },
        error: () => { done(); done(); }
      });
      this.notificationService.getUnreadNotifications(userId).subscribe({
        next: n => { this.stats.unreadNotifications = n.length; done(); }, error: done
      });
    } else { done(); done(); done(); }
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      APPROVED: 'badge-success', DISBURSED: 'badge-success',
      REJECTED: 'badge-danger', PENDING: 'badge-warning', UNDER_REVIEW: 'badge-info'
    };
    return map[status] || 'badge-neutral';
  }

  navigate(path: string): void { this.router.navigate([path]); }
}
