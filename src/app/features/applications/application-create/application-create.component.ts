import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicationService } from '../../../core/services/application.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProgramService } from '../../../core/services/program.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProgramResponse, SchemeResponse } from '../../../core/models/program.model';
import { Role } from '../../../core/models/role.enum';

@Component({
  selector: 'app-application-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-create.component.html',
  styleUrl: './application-create.component.css'
})
export class ApplicationCreateComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  private programService = inject(ProgramService);
  private notificationService = inject(NotificationService);
  public authService = inject(AuthService);
  private router = inject(Router);

  programs: ProgramResponse[] = [];
  schemes: SchemeResponse[] = [];
  saving = false;
  successMsg = '';
  errorMsg = '';
  appliedSchemeIds: Set<number> = new Set();
  private programSub?: Subscription;
  private applicationsSub?: Subscription;

  get isCitizen(): boolean {
    return this.authService.hasRole(Role.CITIZEN);
  }

  form: FormGroup = this.fb.group({
    citizenId: [this.authService.getCitizenId(), Validators.required],
    programId: [null, Validators.required],
    schemeId: [null, Validators.required]
  });

  ngOnInit(): void {
    if (this.isCitizen) {
      this.form.get('citizenId')?.disable();
      this.loadExistingApplications();
    }

    this.programService.getAllPrograms().subscribe({
      next: programs => this.programs = programs.filter(p => p.status === 'ACTIVE'),
      error: () => {}
    });

    this.programSub = this.form.get('programId')?.valueChanges.subscribe(programId => {
      this.form.get('schemeId')?.setValue(null);
      if (programId) {
        this.programService.getSchemesByProgram(programId).subscribe({
          next: schemes => this.schemes = schemes,
          error: () => this.schemes = []
        });
      } else {
        this.schemes = [];
      }
    });
  }

  private loadExistingApplications(): void {
    const citizenId = this.authService.getCitizenId();
    if (citizenId) {
      this.applicationsSub = this.applicationService.getApplicationsByCitizen(citizenId).subscribe({
        next: (applications: any[]) => {
          this.appliedSchemeIds = new Set(
            applications
              .filter(app => app.status !== 'REJECTED')
              .map(app => app.schemeId)
          );
        },
        error: () => { this.appliedSchemeIds = new Set(); }
      });
    }
  }

  ngOnDestroy(): void {
    this.programSub?.unsubscribe();
    this.applicationsSub?.unsubscribe();
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  isSchemeAlreadyApplied(schemeId: number): boolean {
    return !!schemeId && this.appliedSchemeIds.has(Number(schemeId));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const selectedSchemeId = this.form.get('schemeId')?.value;
    if (this.isSchemeAlreadyApplied(selectedSchemeId)) {
      this.errorMsg = 'You have already applied for this scheme. Duplicate applications are not allowed.';
      return;
    }

    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const formData = { ...this.form.getRawValue() };

    this.applicationService.createApplication(formData).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'Application submitted successfully!';
        setTimeout(() => this.router.navigate(['/applications']), 1500);
      },
      error: err => {
        this.errorMsg = err.error?.message || (typeof err.error === 'string' ? err.error : null) || 'Failed to submit application';
        this.saving = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/applications']); }
}

