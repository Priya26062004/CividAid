import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApplicationService } from '../../../core/services/application.service';
import { ProgramService } from '../../../core/services/program.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ApplicationResponse,
  EligibilityCheckResponse,
  NotificationCategory
} from '../../../core/models/application.model';
import { SchemeResponse } from '../../../core/models/program.model';
import { Role } from '../../../core/models/role.enum';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { FormsModule } from '@angular/forms';
import { CitizenService } from '../../../core/services/citizen.service';

@Component({
  selector: 'app-application-status',
  standalone: true,
  imports: [CommonModule, LoaderComponent, FormsModule],
  templateUrl: './application-status.component.html',
  styleUrl: './application-status.component.css'
})
export class ApplicationStatusComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private programService = inject(ProgramService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private citizenService = inject(CitizenService);
  private router = inject(Router);

  applications: ApplicationResponse[] = [];
  statusUpdates: Record<number, string> = {};
  loading = true;

  eligibilityOpen = false;
  eligibilityLoading = false;
  eligibilityApplicationId: number | null = null;
  eligibilityProgramId: number | null = null;
  eligibilityChecks: EligibilityCheckResponse[] = [];
  eligibilitySchemes: SchemeResponse[] = [];
  eligibilityLoadError: string | null = null;

  get isCitizen(): boolean { return this.authService.hasRole(Role.CITIZEN); }
  get canCreate(): boolean { return this.authService.hasRole(Role.CITIZEN, Role.WELFARE_OFFICER, Role.ADMINISTRATOR); }
  get canUpdateStatus(): boolean { return this.authService.hasRole(Role.WELFARE_OFFICER, Role.ADMINISTRATOR); }

  ngOnInit(): void { this.loadApplications(); }

  loadApplications(): void {
    if (this.isCitizen) {
      const citizenId = this.authService.getCitizenId();
      if (citizenId) {
        this.applicationService.getApplicationsByCitizen(citizenId).subscribe({
          next: apps => { this.initApps(apps); this.loading = false; },
          error: () => this.loading = false
        });
      } else { this.loading = false; }
    } else {
      this.applicationService.getAllApplications().subscribe({
        next: apps => { this.initApps(apps); this.loading = false; },
        error: () => this.loading = false
      });
    }
  }

  private initApps(apps: ApplicationResponse[]): void {
    this.applications = apps;
    apps.forEach(a => this.statusUpdates[a.applicationId] = a.status);
  }

  updateStatus(id: number): void {
    const newStatus = this.statusUpdates[id];
    this.applicationService.updateApplicationStatus(id, newStatus).subscribe({
      next: updated => {
        const idx = this.applications.findIndex(a => a.applicationId === id);
        if (idx >= 0) this.applications[idx] = updated;

        // Send notification to the citizen
        this.citizenService.getCitizenById(updated.citizenId).subscribe({
          next: citizen => {
            this.notificationService.createNotification({
              userId: citizen.userId,
              entityId: updated.applicationId,
              message: `The status of your application #${updated.applicationId} has been updated to ${newStatus}.`,
              category: NotificationCategory.APPLICATION
            }).subscribe({
              next: () => this.notificationService.triggerRefresh(),
              error: () => this.notificationService.triggerRefresh() // Still refresh if notif fails
            });
          },
          error: () => this.notificationService.triggerRefresh() // Still refresh if citizen lookup fails
        });
      },
      error: err => alert(err.error || 'Update failed')
    });
  }

  viewEligibility(applicationId: number, programId: number): void {
    this.eligibilityOpen = true;
    this.eligibilityLoading = true;
    this.eligibilityApplicationId = applicationId;
    this.eligibilityProgramId = programId;
    this.eligibilityChecks = [];
    this.eligibilitySchemes = [];
    this.eligibilityLoadError = null;

    const checks$ = this.applicationService.getEligibilityChecksByApplication(applicationId).pipe(
      catchError(() => {
        this.eligibilityLoadError = 'Could not load officer eligibility checks.';
        return of([] as EligibilityCheckResponse[]);
      })
    );
    const schemes$ = this.programService.getSchemesByProgram(programId).pipe(
      catchError(() => {
        this.eligibilityLoadError =
          (this.eligibilityLoadError ? this.eligibilityLoadError + ' ' : '') +
          'Could not load scheme eligibility from the program.';
        return of([] as SchemeResponse[]);
      })
    );

    forkJoin({ checks: checks$, schemes: schemes$ }).subscribe({
      next: ({ checks, schemes }) => {
        this.eligibilityChecks = checks;
        this.eligibilitySchemes = schemes;
        this.eligibilityLoading = false;
      },
      error: () => {
        this.eligibilityLoading = false;
        this.eligibilityLoadError = 'Failed to load eligibility information.';
      }
    });
  }

  closeEligibility(): void {
    this.eligibilityOpen = false;
    this.eligibilityLoading = false;
    this.eligibilityApplicationId = null;
    this.eligibilityProgramId = null;
    this.eligibilityChecks = [];
    this.eligibilitySchemes = [];
    this.eligibilityLoadError = null;
  }

  getCheckResultClass(result: string): string {
    const map: Record<string, string> = {
      ELIGIBLE: 'badge-success',
      INELIGIBLE: 'badge-danger',
      PENDING: 'badge-warning'
    };
    return map[result] || 'badge-neutral';
  }

  createApp(): void { this.router.navigate(['/applications/create']); }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      APPROVED: 'badge-success', DISBURSED: 'badge-success',
      REJECTED: 'badge-danger', PENDING: 'badge-warning', UNDER_REVIEW: 'badge-info'
    };
    return map[status] || 'badge-neutral';
  }
}

