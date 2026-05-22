import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { CitizenService } from '../../../core/services/citizen.service';
import { CitizenResponse, DocumentResponse, DocType } from '../../../core/models/citizen.model';
import { Role } from '../../../core/models/role.enum';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-citizen-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './citizen-profile.component.html',
  styleUrl: './citizen-profile.component.css'
})
export class CitizenProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private citizenService = inject(CitizenService);
  private router = inject(Router);
  private http = inject(HttpClient);

  loading = true;
  citizenProfile: CitizenResponse | null = null;
  documents: DocumentResponse[] = [];
  allCitizens: CitizenResponse[] = [];
  showUpload = false;
  newDoc = { docType: DocType.ID_PROOF };
  selectedFile: File | null = null;
  selectedCitizenId: number | null = null;
  selectedCitizenDocs: DocumentResponse[] = [];
  showDocumentModal = false;
  viewingDocument: { doc: DocumentResponse; dataUrl: string } | null = null;

  get isCitizen(): boolean { return this.authService.hasRole(Role.CITIZEN); }
  get canEdit(): boolean { return this.authService.hasRole(Role.CITIZEN, Role.WELFARE_OFFICER, Role.ADMINISTRATOR); }
  get canEditOther(): boolean { return this.authService.hasRole(Role.ADMINISTRATOR); }
  get canVerifyDocs(): boolean { return this.authService.hasRole(Role.WELFARE_OFFICER, Role.ADMINISTRATOR); }

  ngOnInit(): void {
    console.log('CitizenProfileComponent initialized');
    console.log('Is Citizen:', this.isCitizen);
    if (this.isCitizen) this.loadOwnProfile();
    else this.loadAllCitizens();
  }

  private loadOwnProfile(): void {
    const userId = this.authService.getUserId();
    console.log('Loading own profile for userId:', userId);
    if (!userId) { 
      console.warn('No userId found in localStorage');
      this.loading = false; 
      return; 
    }
    this.citizenService.getCitizenByUserId(userId).subscribe({
      next: citizen => {
        console.log('Citizen profile loaded:', citizen);
        this.citizenProfile = citizen;
        this.authService.setCitizenId(citizen.citizenId);
        this.loadDocuments(citizen.citizenId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading citizen profile:', error);
        this.loading = false;
      }
    });
  }

  private loadDocuments(citizenId: number): void {
    this.citizenService.getDocumentsByCitizen(citizenId).subscribe({
      next: docs => this.documents = docs, error: () => {}
    });
  }

  private loadAllCitizens(): void {
    this.citizenService.getAllCitizens().subscribe({
      next: citizens => { this.allCitizens = citizens; this.loading = false; },
      error: () => this.loading = false
    });
  }

  editProfile(): void {
    if (this.citizenProfile) this.router.navigate(['/citizens/edit', this.citizenProfile.citizenId]);
  }

  editCitizen(id: number): void { this.router.navigate(['/citizens/edit', id]); }

  viewCitizenDocs(citizenId: number): void {
    if (this.selectedCitizenId === citizenId) {
      // Toggle off if clicking the same citizen
      this.selectedCitizenId = null;
      this.selectedCitizenDocs = [];
      return;
    }
    this.selectedCitizenId = citizenId;
    this.citizenService.getDocumentsByCitizen(citizenId).subscribe({
      next: docs => this.selectedCitizenDocs = docs
    });
  }

  verifyDocument(docId: number, status: string): void {
    this.citizenService.verifyDocument(docId, status).subscribe({
      next: updated => {
        let idx = this.documents.findIndex(d => d.documentId === docId);
        if (idx >= 0) this.documents[idx] = updated;

        idx = this.selectedCitizenDocs.findIndex(d => d.documentId === docId);
        if (idx >= 0) this.selectedCitizenDocs[idx] = updated;
      },
      error: err => alert(err.error || 'Verification failed')
    });
  }

  uploadDocument(): void {
    if (!this.citizenProfile || !this.selectedFile) return;
    this.citizenService.uploadDocument({
      citizenId: this.citizenProfile.citizenId,
      docType: this.newDoc.docType,
      file: this.selectedFile
    }).subscribe({
      next: () => {
        this.showUpload = false;
        this.newDoc = { docType: DocType.ID_PROOF };
        this.selectedFile = null;
        this.loadDocuments(this.citizenProfile!.citizenId);
      },
      error: err => alert(err.error || 'Upload failed')
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  viewDocument(doc: DocumentResponse): void {
    try {
      const downloadUrl = this.citizenService.downloadDocument(doc.documentId);
      
      this.http.get(downloadUrl, { responseType: 'blob' }).subscribe({
        next: (blob: Blob) => {
          const fileType = doc.fileType || blob.type || 'application/octet-stream';
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.viewingDocument = {
              doc,
              dataUrl: e.target.result
            };
            this.showDocumentModal = true;
          };
          reader.readAsDataURL(blob);
        },
        error: (error) => {
          console.error('Error loading document:', error);
          alert('Unable to load document. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Unable to open document. Please try again.');
    }
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.viewingDocument = null;
  }

  getVerificationClass(status: string): string {
    const map: Record<string, string> = { VERIFIED: 'badge-success', REJECTED: 'badge-danger', PENDING: 'badge-warning' };
    return map[status] || 'badge-neutral';
  }
}

