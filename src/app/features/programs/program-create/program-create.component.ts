import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';

@Component({
  selector: 'app-program-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './program-create.component.html',
  styleUrl: './program-create.component.css'
})
export class ProgramCreateComponent {
  private fb = inject(FormBuilder);
  private programService = inject(ProgramService);
  private router = inject(Router);

  saving = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    budget: [0, [Validators.required, Validators.min(1)]],
    status: ['ACTIVE']
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.programService.createProgram(this.form.value).subscribe({
      next: resp => {
        this.successMsg = `Program "${resp.title}" created with ID #${resp.programId}`;
        this.saving = false;
        this.form.reset({ status: 'ACTIVE', budget: 0 });
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Failed to create program';
        this.saving = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/programs']); }
}
