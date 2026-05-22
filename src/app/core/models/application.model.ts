export enum ApplicationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED'
}

export enum CheckResult {
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
  PENDING = 'PENDING'
}

export enum DisbursementStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  BANK = 'BANK',
  WALLET = 'WALLET',
  CASH = 'CASH'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum ComplianceEntityType {
  APPLICATION = 'APPLICATION',
  PROGRAM = 'PROGRAM',
  DISBURSEMENT = 'DISBURSEMENT'
}

export enum ComplianceResult {
  PENDING = 'PENDING',
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT'
}

export enum AuditStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED'
}

export enum NotificationCategory {
  APPLICATION = 'APPLICATION',
  DISBURSEMENT = 'DISBURSEMENT',
  PAYMENT = 'PAYMENT',
  COMPLIANCE = 'COMPLIANCE',
  PROGRAM = 'PROGRAM',
  GENERAL = 'GENERAL'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ'
}

export enum ReportScope {
  CITIZEN = 'CITIZEN',
  APPLICATION = 'APPLICATION',
  PROGRAM = 'PROGRAM',
  DISBURSEMENT = 'DISBURSEMENT',
  COMPLIANCE = 'COMPLIANCE'
}

/** POST /applications request */
export interface ApplicationRequest {
  citizenId: number;
  programId: number;
}

/** GET /applications/{id} response */
export interface ApplicationResponse {
  applicationId: number;
  citizenId: number;
  programId: number;
  submittedDate: string;
  status: ApplicationStatus;
  createdAt: string;
}

/** POST /eligibility-checks request */
export interface EligibilityCheckRequest {
  applicationId: number;
  officerId: number;
  result: CheckResult;
  notes: string;
}

/** GET /eligibility-checks/{id} response */
export interface EligibilityCheckResponse {
  checkId: number;
  applicationId: number;
  officerId: number;
  result: CheckResult;
  date: string;
  notes: string;
}

/** POST /disbursements request */
export interface DisbursementRequest {
  applicationId: number;
  amount: number;
  citizenId: number;
}

/** GET /disbursements/{id} response */
export interface DisbursementResponse {
  disbursementId: number;
  applicationId: number;
  citizenId: number;
  amount: number;
  date: string;
  status: DisbursementStatus;
  createdAt: string;
}

/** POST /payments request */
export interface PaymentRequest {
  disbursementId: number;
  method: PaymentMethod;
}

/** GET /payments/{id} response */
export interface PaymentResponse {
  paymentId: number;
  disbursementId: number;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
}

/** POST /compliance request */
export interface ComplianceRecordRequest {
  entityId: number;
  type: ComplianceEntityType;
  result: ComplianceResult;
  notes: string;
}

/** GET /compliance/{id} response */
export interface ComplianceRecordResponse {
  complianceId: number;
  entityId: number;
  type: ComplianceEntityType;
  result: ComplianceResult;
  date: string;
  notes: string;
  createdAt: string;
}

/** POST /audits request */
export interface AuditRequest {
  officerId: number;
  scope: string;
  findings: string;
  userId: number;
  citizenId: number;
  modeOfApplication: string;
}

/** GET /audits/{id} response */
export interface AuditResponse {
  auditId: number;
  officerId: number;
  scope: string;
  findings: string;
  userId: number;
  citizenId: number;
  modeOfApplication: string;
  date: string;
  status: AuditStatus;
  createdAt: string;
}

/** POST /notifications request */
export interface NotificationRequest {
  userId: number;
  entityId: number;
  message: string;
  category: NotificationCategory;
}

/** GET /notifications/{id} response */
export interface NotificationResponse {
  notificationId: number;
  userId: number;
  entityId: number;
  message: string;
  category: NotificationCategory;
  status: NotificationStatus;
  createdDate: string;
}

/** POST /reports request */
export interface ReportRequest {
  scope: ReportScope;
  metrics: string;
}

/** GET /reports/{id} response */
export interface ReportResponse {
  reportId: number;
  scope: ReportScope;
  metrics: string;
  generatedDate: string;
  createdAt: string;
}
