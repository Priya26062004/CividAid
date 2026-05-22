export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum CitizenStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum DocType {
  ID_PROOF = 'ID_PROOF',
  RESIDENCE = 'RESIDENCE',
  INCOME = 'INCOME',
  OTHER = 'OTHER'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

/** PUT /citizens/{id} request */
export interface CitizenRequest {
  name: string;
  dob?: string;
  gender?: Gender;
  address?: string;
  contactInfo?: string;
  userId?: number;
}

/** GET /citizens/{id} response */
export interface CitizenResponse {
  citizenId: number;
  name: string;
  dob: string;
  gender: Gender;
  address: string;
  contactInfo: string;
  status: CitizenStatus;
  userId: number;
  createdAt: string;
}

/** POST /documents request */
export interface DocumentUploadRequest {
  citizenId: number;
  docType: DocType;
  file: File;
}

/** GET /documents/{id} response */
export interface DocumentResponse {
  documentId: number;
  citizenId: number;
  docType: DocType;
  fileName?: string;
  fileType?: string;
  fileUri?: string;
  uploadedDate: string;
  verificationStatus: VerificationStatus;
}
