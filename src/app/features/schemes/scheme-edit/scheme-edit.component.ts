import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { SchemeStatus, ProgramResponse } from '../../../core/models/program.model';

@Component({
  selector: 'app-scheme-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scheme-edit.component.html',
  styleUrl: './scheme-edit.component.css'
})
export class SchemeEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);

  form!: FormGroup;
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';
  schemeId = 0;
  programs: ProgramResponse[] = [];
  statuses = Object.values(SchemeStatus);

  ngOnInit(): void {
    this.schemeId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.form = this.fb.group({
      programId: [null, Validators.required],
      title: ['', Validators.required],
      description: [''],
      eligibilityCriteria: [''],
      budget: [0, [Validators.required, Validators.min(0)]],
      status: [SchemeStatus.ACTIVE, Validators.required]
    });

    // Load active programs for the dropdown and then load scheme data
    this.programService.getAllPrograms().subscribe({
      next: (programs) => {
        this.programs = programs.filter(p => p.status === 'ACTIVE');
        this.loadScheme();
      },
      error: () => this.loadScheme() // Proceed anyway, dropdown might be empty
    });
  }

  private loadScheme() {
    this.programService.getSchemeById(this.schemeId).subscribe({
      next: (scheme) => {
        this.form.patchValue({
          programId: scheme.programId,
          title: scheme.title,
          description: scheme.description || '',
          eligibilityCriteria: scheme.eligibilityCriteria || '',
          budget: scheme.budget,
          status: scheme.status
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to load scheme';
        this.loading = false;
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.programService.updateScheme(this.schemeId, this.form.value).subscribe({
      next: (resp) => {
        this.successMsg = `Scheme "${resp.title}" updated successfully!`;
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to update scheme';
        this.saving = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/schemes']); }
}
