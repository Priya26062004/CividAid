import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApplicationService } from '../../../core/services/application.service';
import { DisbursementService } from '../../../core/services/disbursement.service';
import { CitizenService } from '../../../core/services/citizen.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ApplicationResponse,
  DisbursementResponse,
  PaymentMethod,
  NotificationCategory
} from '../../../core/models/application.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css'
})
export class PaymentListComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private disbursementService = inject(DisbursementService);
  private citizenService = inject(CitizenService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  readonly PaymentMethod = PaymentMethod;

  /** Processed disbursements awaiting payment */
  pendingDisbursements: DisbursementResponse[] = [];
  applicationsMap: Map<number, ApplicationResponse> = new Map();

  /** Track selected payment method per disbursement */
  paymentMethods: Record<number, PaymentMethod> = {};

  /** Track which row is currently being processed */
  processingIds = new Set<number>();

  /** Track which row just completed successfully */
  completedIds = new Set<number>();

  /** Disbursement ID awaiting confirmation */
  confirmDisbId: number | null = null;

  loading = true;
  successMessage = '';
  errorMessage = '';

  /** Count of disbursements processed in this session */
  processedCount = 0;

  ngOnInit(): void {
    this.loadPendingPayments();
  }

  loadPendingPayments(): void {
    this.loading = true;
    forkJoin({
      disbursements: this.disbursementService.getAllDisbursements(),
      apps: this.applicationService.getAllApplications()
    }).subscribe({
      next: ({ disbursements, apps }) => {
        this.applicationsMap = new Map(apps.map(a => [a.applicationId, a]));

        const processed = disbursements.filter(d => d.status === 'PROCESSED');
        if (processed.length === 0) {
          this.pendingDisbursements = [];
          this.loading = false;
          return;
        }

        forkJoin(processed.map(d => this.disbursementService.getPaymentsByDisbursement(d.disbursementId))).subscribe({
          next: paymentsByDisbursement => {
            this.pendingDisbursements = processed.filter((d, idx) => (paymentsByDisbursement[idx] || []).length === 0);

            // Initialize defaults for each disbursement
            this.pendingDisbursements.forEach(d => {
              if (!this.paymentMethods[d.disbursementId]) {
                this.paymentMethods[d.disbursementId] = PaymentMethod.BANK;
              }
            });

            this.loading = false;
          },
          error: () => {
            this.errorMessage = 'Failed to load payments. Please try again.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Failed to load payments. Please try again.';
        this.loading = false;
      }
    });
  }

  /** Show confirmation overlay for a specific disbursement */
  confirmProcess(disbId: number): void {
    this.confirmDisbId = disbId;
  }

  /** Cancel the confirmation */
  cancelConfirm(): void {
    this.confirmDisbId = null;
  }

  /**
   * Full payment processing pipeline:
   * 1. Create payment record with chosen method
   * 2. Update application status to DISBURSED
   * 3. Send notification to the citizen
   * 4. Refresh the list
   */
  processPayment(disbId: number): void {
    this.confirmDisbId = null;
    this.successMessage = '';
    this.errorMessage = '';

    const disb = this.pendingDisbursements.find(d => d.disbursementId === disbId);
    if (!disb) return;

    const method = this.paymentMethods[disbId];
    this.processingIds.add(disbId);

    // Step 1: Create payment
    this.disbursementService.createPayment({
      disbursementId: disb.disbursementId,
      method: method
    }).subscribe({
      next: () => {
        // Step 2: Update application status to DISBURSED
        this.applicationService.updateApplicationStatus(disb.applicationId, 'DISBURSED').subscribe({
          next: () => {
            // Step 3: Send notification to citizen
            const app = this.applicationsMap.get(disb.applicationId);
            if (app) {
              this.sendCitizenNotification(disb, app, method);
            } else {
              this.handleSuccess(disbId);
            }
          },
          error: (err) => {
            // Payment created but status update failed
            this.handleError(disbId, 'Payment recorded but failed to update application status. Please update manually.');
          }
        });
      },
      error: (err) => {
        this.handleError(disbId, err.error || 'Failed to record payment. Please try again.');
      }
    });
  }

  /**
   * Look up the citizen's userId and send a notification about the payment.
   */
  private sendCitizenNotification(disb: DisbursementResponse, app: ApplicationResponse, method: PaymentMethod): void {
    // Backend disbursement-service now automatically sends the notification using the correct userId.
    this.handleSuccess(disb.disbursementId);
  }

  private handleSuccess(disbId: number, notifFailed = false): void {
    this.processingIds.delete(disbId);
    this.completedIds.add(disbId);
    this.processedCount++;

    if (notifFailed) {
      this.successMessage = `Disbursement #${disbId} has been paid successfully. (Notification could not be sent.)`;
    } else {
      this.successMessage = `Disbursement #${disbId} has been paid successfully. Citizen has been notified.`;
    }

    this.notificationService.triggerRefresh();
    this.clearMessageAfterDelay();

    // Remove from list after a brief delay so the user can see the success state
    setTimeout(() => {
      this.pendingDisbursements = this.pendingDisbursements.filter(d => d.disbursementId !== disbId);
      this.completedIds.delete(disbId);
    }, 2000);
  }

  private handleError(disbId: number, message: string): void {
    this.processingIds.delete(disbId);
    this.errorMessage = message;
    this.clearMessageAfterDelay();
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 6000);
  }

  getMethodLabel(method: PaymentMethod): string {
    const labels: Record<string, string> = {
      BANK: 'Bank Transfer',
      WALLET: 'Digital Wallet',
      CASH: 'Cash'
    };
    return labels[method] || method;
  }

  isProcessing(disbId: number): boolean {
    return this.processingIds.has(disbId);
  }

  isCompleted(disbId: number): boolean {
    return this.completedIds.has(disbId);
  }

  dismissSuccess(): void {
    this.successMessage = '';
  }

  dismissError(): void {
    this.errorMessage = '';
  }
}
