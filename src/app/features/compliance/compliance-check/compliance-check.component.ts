import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ComplianceService } from '../../../core/services/compliance.service';
import { AuthService } from '../../../core/services/auth.service';
import { ComplianceRecordResponse, AuditResponse } from '../../../core/models/application.model';
import { Role } from '../../../core/models/role.enum';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-compliance-check',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './compliance-check.component.html',
  styleUrl: './compliance-check.component.css'
})
export class ComplianceCheckComponent implements OnInit {
  private complianceService = inject(ComplianceService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab = 'compliance';
  loading = true;
  complianceRecords: ComplianceRecordResponse[] = [];
  audits: AuditResponse[] = [];
  auditStatusUpdates: Record<number, string> = {};

  compForm: FormGroup = this.fb.group({
    entityId: [null, Validators.required],
    type: ['APPLICATION', Validators.required],
    result: ['PENDING', Validators.required],
    notes: ['']
  });

  auditForm: FormGroup = this.fb.group({
    officerId: [null, Validators.required],
    scope: ['', Validators.required],
    findings: [''],
    userId: [null],
    citizenId: [null],
    modeOfApplication: ['']
  });

  get canCreate(): boolean { return this.authService.hasRole(Role.COMPLIANCE_OFFICER, Role.ADMINISTRATOR); }
  get canUpdateAudit(): boolean { return this.authService.hasRole(Role.COMPLIANCE_OFFICER, Role.ADMINISTRATOR); }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    let loaded = 0;
    const done = () => { if (++loaded >= 2) this.loading = false; };
    this.complianceService.getAllComplianceRecords().subscribe({ next: d => { this.complianceRecords = d; done(); }, error: done });
    this.complianceService.getAllAudits().subscribe({
      next: d => { this.audits = d; d.forEach(a => this.auditStatusUpdates[a.auditId] = a.status); done(); },
      error: done
    });
  }

  createCompliance(): void {
    this.complianceService.createComplianceRecord(this.compForm.value).subscribe({
      next: () => { this.compForm.reset({ type: 'APPLICATION', result: 'PENDING' }); this.loadData(); },
      error: err => alert(err.error || 'Failed')
    });
  }

  createAudit(): void {
    this.complianceService.createAudit(this.auditForm.value).subscribe({
      next: () => { this.auditForm.reset(); this.loadData(); },
      error: err => alert(err.error || 'Failed')
    });
  }

  updateAuditStatus(id: number): void {
    this.complianceService.updateAuditStatus(id, this.auditStatusUpdates[id]).subscribe({
      next: updated => {
        const idx = this.audits.findIndex(a => a.auditId === id);
        if (idx >= 0) this.audits[idx] = updated;
      },
      error: err => alert(err.error || 'Update failed')
    });
  }

  getComplianceBadge(result: string): string {
    const map: Record<string, string> = { COMPLIANT: 'badge-success', NON_COMPLIANT: 'badge-danger', PENDING: 'badge-warning' };
    return map[result] || 'badge-neutral';
  }

  getAuditBadge(status: string): string {
    const map: Record<string, string> = { COMPLETED: 'badge-success', IN_PROGRESS: 'badge-warning', CLOSED: 'badge-neutral' };
    return map[status] || 'badge-neutral';
  }
}
