import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DisbursementService } from '../../../core/services/disbursement.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CitizenService } from '../../../core/services/citizen.service';
import { AuthService } from '../../../core/services/auth.service';
import { DisbursementResponse, NotificationCategory, ApplicationResponse } from '../../../core/models/application.model';
import { Role } from '../../../core/models/role.enum';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-disbursement-list',
  standalone: true,
  imports: [CommonModule, LoaderComponent, FormsModule],
  templateUrl: './disbursement-list.component.html',
  styleUrl: './disbursement-list.component.css'
})
export class DisbursementListComponent implements OnInit {
  private disbursementService = inject(DisbursementService);
  private notificationService = inject(NotificationService);
  private citizenService = inject(CitizenService);
  private authService = inject(AuthService);
  private applicationService = inject(ApplicationService);

  disbursements: DisbursementResponse[] = [];
  applications: ApplicationResponse[] = [];
  statusUpdates: Record<number, string> = {};
  loading = true;
  newDisb = { applicationId: 0, citizenId: 0, amount: 0 };
  errorMessage = '';

  get isFormValid(): boolean {
    return this.newDisb.applicationId > 0 && this.newDisb.citizenId > 0 && this.newDisb.amount > 0;
  }

  get canCreate(): boolean {
    return this.authService.hasRole(Role.WELFARE_OFFICER, Role.PROGRAM_MANAGER, Role.ADMINISTRATOR);
  }
  get canUpdate(): boolean {
    return this.authService.hasRole(Role.WELFARE_OFFICER, Role.PROGRAM_MANAGER, Role.ADMINISTRATOR);
  }

  ngOnInit(): void { 
    this.loadDisbursements(); 
    this.loadApplications();
  }

  loadDisbursements(): void {
    this.disbursementService.getAllDisbursements().subscribe({
      next: data => {
        this.disbursements = data;
        data.forEach(d => this.statusUpdates[d.disbursementId] = d.status);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadApplications(): void {
    this.applicationService.getAllApplications().subscribe({
      next: data => {
        // Only APPROVED applications can have disbursements created for them
        this.applications = data.filter(a => a.status === 'APPROVED');
      },
      error: err => console.error('Failed to load applications', err)
    });
  }

  onApplicationChange(): void {
    const selectedApp = this.applications.find(a => a.applicationId == this.newDisb.applicationId);
    if (selectedApp) {
      this.newDisb.citizenId = selectedApp.citizenId;
    } else {
      this.newDisb.citizenId = 0;
    }
  }

  createDisbursement(): void {
    this.errorMessage = '';
    if (this.newDisb.applicationId <= 0) {
      this.errorMessage = 'Please select an application.';
      return;
    }
    if (this.newDisb.amount <= 0) {
      this.errorMessage = 'Please enter a valid amount.';
      return;
    }
    if (this.newDisb.citizenId <= 0) {
      this.errorMessage = 'Citizen ID is missing for the selected application.';
      return;
    }
    this.disbursementService.createDisbursement(this.newDisb).subscribe({
      next: () => this.loadAfterDisbursementCreate(),
      error: err => this.errorMessage = this.getErrorMessage(err, 'Failed to create disbursement')
    });
  }

  private loadAfterDisbursementCreate(): void {
    this.newDisb = { applicationId: 0, citizenId: 0, amount: 0 };
    this.errorMessage = '';
    this.loadDisbursements();
  }

  updateStatus(id: number): void {
    this.disbursementService.updateDisbursementStatus(id, this.statusUpdates[id]).subscribe({
      next: updated => {
        const idx = this.disbursements.findIndex(d => d.disbursementId === id);
        if (idx >= 0) this.disbursements[idx] = updated;
      },
      error: err => alert(this.getErrorMessage(err, 'Update failed'))
    });
  }

  viewPayments(disbursementId: number): void {
    this.disbursementService.getPaymentsByDisbursement(disbursementId).subscribe({
      next: payments => alert(
        payments.length === 0
          ? 'No payments for this disbursement.'
          : payments.map(p => `Payment #${p.paymentId}: ${p.method} — ${p.status}`).join('\n')
      ),
      error: () => alert('Failed to load payments')
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PROCESSED: 'badge-success', PENDING: 'badge-warning',
      FAILED: 'badge-danger', CANCELLED: 'badge-danger'
    };
    return map[status] || 'badge-neutral';
  }

  private getErrorMessage(err: unknown, fallback: string): string {
    const anyErr = err as any;
    if (anyErr?.error) {
      if (typeof anyErr.error === 'string') return anyErr.error;
      if (typeof anyErr.error?.message === 'string') return anyErr.error.message;
    }
    if (typeof anyErr?.message === 'string') return anyErr.message;
    return fallback;
  }
}
