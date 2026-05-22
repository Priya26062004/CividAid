import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { ProgramResponse, SchemeResponse } from '../../../core/models/program.model';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.enum';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css'
})
export class ProgramListComponent implements OnInit {
  private programService = inject(ProgramService);
  private authService = inject(AuthService);
  private router = inject(Router);

  programs: ProgramResponse[] = [];
  schemes: SchemeResponse[] = []; // for the currently expanded program
  allSchemes: SchemeResponse[] = []; // to calculate budgets
  selectedProgramId: number | null = null;
  loading = true;

  get canCreate(): boolean {
    return this.authService.hasRole(Role.PROGRAM_MANAGER, Role.ADMINISTRATOR);
  }
  get canDelete(): boolean {
    return this.authService.hasRole(Role.ADMINISTRATOR);
  }
  get canViewBudget(): boolean {
    return this.authService.hasRole(Role.PROGRAM_MANAGER, Role.ADMINISTRATOR);
  }

  ngOnInit(): void { 
    this.loadPrograms(); 
    if (this.canViewBudget) {
      this.programService.getAllSchemes().subscribe({
        next: s => this.allSchemes = s,
        error: () => {}
      });
    }
  }

  loadPrograms(): void {
    this.programService.getAllPrograms().subscribe({
      next: p => { this.programs = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getBudgetUsed(programId: number): number {
    return this.allSchemes
      .filter(s => s.programId === programId)
      .reduce((sum, scheme) => sum + scheme.budget, 0);
  }

  toggleSchemes(program: ProgramResponse): void {
    if (this.selectedProgramId === program.programId) {
      this.selectedProgramId = null; this.schemes = []; return;
    }
    this.selectedProgramId = program.programId;
    this.programService.getSchemesByProgram(program.programId).subscribe({
      next: s => this.schemes = s, error: () => this.schemes = []
    });
  }

  createProgram(): void { this.router.navigate(['/programs/create']); }
  editProgram(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/programs/edit', id]);
  }

  deleteProgram(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Delete this program?')) {
      this.programService.deleteProgram(id).subscribe({
        next: () => this.loadPrograms(),
        error: err => alert(err.error?.message || err.error || 'Failed to delete. Ensure it has no active schemes.')
      });
    }
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'badge-success' : 'badge-neutral';
  }
}
