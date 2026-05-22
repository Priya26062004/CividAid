import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { ReportResponse } from '../../../core/models/application.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './report-dashboard.component.html',
  styleUrl: './report-dashboard.component.css'
})
export class ReportDashboardComponent implements OnInit {
  private reportService = inject(ReportService);
  private fb = inject(FormBuilder);

  reports: ReportResponse[] = [];
  loading = true;
  generating = false;
  genSuccess = '';
  activeScope = '';
  scopes = ['CITIZEN', 'APPLICATION', 'PROGRAM', 'DISBURSEMENT', 'COMPLIANCE'];

  reportForm: FormGroup = this.fb.group({
    scope: ['CITIZEN', Validators.required],
    metrics: ['', Validators.required]
  });

  ngOnInit(): void { this.loadReports(); }

  loadReports(): void {
    this.activeScope = '';
    this.reportService.getAllReports().subscribe({
      next: data => { this.reports = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  generateReport(): void {
    if (this.reportForm.invalid) return;
    this.generating = true;
    this.genSuccess = '';
    this.reportService.generateReport(this.reportForm.value).subscribe({
      next: resp => {
        this.genSuccess = `Report #${resp.reportId} generated for scope: ${resp.scope}`;
        this.generating = false;
        this.loadReports();
      },
      error: err => { alert(err.error || 'Failed to generate report'); this.generating = false; }
    });
  }

  filterByScope(scope: string): void {
    this.activeScope = scope;
    this.loading = true;
    this.reportService.getReportsByScope(scope).subscribe({
      next: data => { this.reports = data; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
