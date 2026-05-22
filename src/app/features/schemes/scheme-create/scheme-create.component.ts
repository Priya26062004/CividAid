import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { ProgramResponse } from '../../../core/models/program.model';

@Component({
  selector: 'app-scheme-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scheme-create.component.html',
  styleUrl: './scheme-create.component.css'
})
export class SchemeCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private programService = inject(ProgramService);
  private router = inject(Router);

  programs: ProgramResponse[] = [];
  saving = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup = this.fb.group({
    programId: [null, Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    budget: [0, [Validators.required, Validators.min(1)]],
    eligibilityCriteria: ['', Validators.required]
  });

  ngOnInit(): void {
    this.programService.getAllPrograms().subscribe({
      next: programs => this.programs = programs.filter(p => p.status === 'ACTIVE'),
      error: () => {}
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

    this.programService.createScheme(this.form.value).subscribe({
      next: resp => {
        this.successMsg = `Scheme "${resp.title}" created with ID #${resp.schemeId}`;
        this.saving = false;
        setTimeout(() => this.router.navigate(['/schemes', resp.schemeId]), 1500);
      },
      error: err => {
        this.errorMsg = err.error?.message || err.error || 'Failed to create scheme';
        this.saving = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/schemes']); }
}
