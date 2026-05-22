import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { AuthService } from '../../../core/services/auth.service';
import { SchemeResponse, ProgramResponse } from '../../../core/models/program.model';
import { Role } from '../../../core/models/role.enum';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-scheme-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './scheme-list.component.html',
  styleUrl: './scheme-list.component.css'
})
export class SchemeListComponent implements OnInit {
  private programService = inject(ProgramService);
  private authService = inject(AuthService);
  private router = inject(Router);

  allSchemes: SchemeResponse[] = [];
  filteredSchemes: SchemeResponse[] = [];
  programs: ProgramResponse[] = [];
  loading = true;
  searchTerm = '';
  filterStatus = '';

  get canCreate(): boolean {
    return this.authService.hasRole(Role.PROGRAM_MANAGER, Role.ADMINISTRATOR);
  }
  get canViewBudget(): boolean {
    return this.authService.hasRole(Role.PROGRAM_MANAGER, Role.ADMINISTRATOR);
  }

  ngOnInit(): void { 
    this.loadSchemes(); 
    if (this.canViewBudget) {
      this.programService.getAllPrograms().subscribe({
        next: p => this.programs = p,
        error: () => {}
      });
    }
  }

  loadSchemes(): void {
    this.programService.getAllSchemes().subscribe({
      next: schemes => {
        this.allSchemes = schemes;
        this.filteredSchemes = schemes;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters(): void {
    this.filteredSchemes = this.allSchemes.filter(s => {
      const matchSearch = !this.searchTerm ||
        s.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (s.eligibilityCriteria || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.filterStatus || s.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  getProgram(programId: number): ProgramResponse | undefined {
    return this.programs.find(p => p.programId === programId);
  }

  getProgramBudgetUsed(programId: number): number {
    return this.allSchemes
      .filter(s => s.programId === programId)
      .reduce((sum, scheme) => sum + scheme.budget, 0);
  }

  viewScheme(id: number): void { this.router.navigate(['/schemes', id]); }
  createScheme(): void { this.router.navigate(['/schemes/create']); }
  editScheme(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/schemes/edit', id]);
  }

  deleteScheme(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Delete this scheme?')) {
      this.programService.deleteScheme(id).subscribe({
        next: () => this.loadSchemes(),
        error: err => alert(err.error?.message || err.error || 'Failed to delete scheme')
      });
    }
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'badge-success' : 'badge-neutral';
  }
}
