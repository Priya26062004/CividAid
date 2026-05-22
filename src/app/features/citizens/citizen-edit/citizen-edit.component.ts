import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CitizenService } from '../../../core/services/citizen.service';

@Component({
  selector: 'app-citizen-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './citizen-edit.component.html',
  styleUrl: './citizen-edit.component.css'
})
export class CitizenEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private citizenService = inject(CitizenService);

  citizenId = 0;
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';

  editForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    dob: [''],
    gender: [''],
    address: [''],
    contactInfo: ['']
  });

  ngOnInit(): void {
    this.citizenId = Number(this.route.snapshot.paramMap.get('id'));
    this.citizenService.getCitizenById(this.citizenId).subscribe({
      next: citizen => {
        this.editForm.patchValue({
          name: citizen.name || '',
          dob: citizen.dob || '',
          gender: citizen.gender || '',
          address: citizen.address || '',
          contactInfo: citizen.contactInfo || ''
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.citizenService.updateCitizen(this.citizenId, this.editForm.value).subscribe({
      next: () => { this.successMsg = 'Profile updated successfully!'; this.saving = false; },
      error: err => { this.errorMsg = err.error?.message || 'Failed to update profile'; this.saving = false; }
    });
  }

  goBack(): void { this.router.navigate(['/citizens']); }
}
