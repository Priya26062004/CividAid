import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { ApplicationService } from '../../../core/services/application.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CitizenService } from '../../../core/services/citizen.service';
import { AuthService } from '../../../core/services/auth.service';
import { SchemeResponse, ProgramResponse } from '../../../core/models/program.model';
import { Role } from '../../../core/models/role.enum';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-scheme-detail',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './scheme-detail.component.html',
  styleUrl: './scheme-detail.component.css'
})
export class SchemeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);
  private applicationService = inject(ApplicationService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private citizenService = inject(CitizenService);

  scheme: SchemeResponse | null = null;
  program: ProgramResponse | null = null;
  loading = true;
  applying = false;
  applyMsg = '';
  applyError = '';

  get isCitizen(): boolean { return this.authService.hasRole(Role.CITIZEN); }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programService.getSchemeById(id).subscribe({
      next: scheme => {
        this.scheme = scheme;
        this.programService.getProgramById(scheme.programId).subscribe({
          next: prog => { this.program = prog; this.loading = false; },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  applyNow(): void {
    const citizenId = this.authService.getCitizenId();
    const programId = this.scheme?.programId;
    if (!citizenId || !programId) {
      this.applyError = 'Please complete your citizen profile first.'; return;
    }
    this.applying = true;
    this.applyMsg = '';
    this.applyError = '';

    this.citizenService.getDocumentsByCitizen(citizenId).subscribe({
      next: docs => {
        const hasVerifiedDoc = docs.some(d => d.verificationStatus === 'VERIFIED');
        if (!hasVerifiedDoc) {
          this.applyError = 'Your documents must be verified by a Welfare Officer before you can apply for schemes.';
          this.applying = false;
          return;
        }

        this.applicationService.createApplication({ citizenId, programId }).subscribe({
          next: resp => {
            this.applyMsg = `Application #${resp.applicationId} submitted! Status: ${resp.status}`;
            this.applying = false;
          },
          error: err => {
            this.applyError = err.error?.message || err.error || 'Application failed.';
            this.applying = false;
          }
        });
      },
      error: () => {
        this.applyError = 'Failed to verify document status. Please try again.';
        this.applying = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/schemes']); }
}

