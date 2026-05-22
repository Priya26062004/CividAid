import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { ProgramStatus } from '../../../core/models/program.model';

@Component({
  selector: 'app-program-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './program-edit.component.html',
  styleUrl: './program-edit.component.css'
})
export class ProgramEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private programService = inject(ProgramService);

  form!: FormGroup;
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';
  programId = 0;
  statuses = Object.values(ProgramStatus);

  ngOnInit(): void {
    this.programId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      budget: [0, [Validators.required, Validators.min(0)]],
      status: [ProgramStatus.ACTIVE, Validators.required]
    });

    this.programService.getProgramById(this.programId).subscribe({
      next: (program) => {
        this.form.patchValue({
          title: program.title,
          description: program.description || '',
          startDate: program.startDate,
          endDate: program.endDate,
          budget: program.budget,
          status: program.status
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to load program';
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

    this.programService.updateProgram(this.programId, this.form.value).subscribe({
      next: (resp) => {
        this.successMsg = `Program "${resp.title}" updated successfully!`;
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to update program';
        this.saving = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/programs']); }
}
