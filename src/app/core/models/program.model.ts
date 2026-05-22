// ═══════════════════════════════════════════
// Program & Scheme models — aligned to backend
// ═══════════════════════════════════════════

/** Matches Program.ProgramStatus enum in backend entity */
export enum ProgramStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED'
}

/** Matches Scheme.SchemeStatus enum in backend entity */
export enum SchemeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED'
}

// ── Program DTOs ──

/** Maps to ProgramRequestDto.java */
export interface ProgramRequest {
  title: string;
  description?: string;
  startDate: string;       // LocalDate → ISO string
  endDate: string;         // LocalDate → ISO string
  budget: number;          // BigDecimal → number
  status?: ProgramStatus;
}

/** Maps to ProgramResponseDto.java */
export interface ProgramResponse {
  programId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProgramStatus;
  createdAt: string;       // LocalDateTime → ISO string
}

// ── Scheme DTOs ──

/** Maps to SchemeRequestDto.java */
export interface SchemeRequest {
  programId: number;
  title: string;
  description?: string;
  budget: number;            // BigDecimal → number (required in backend DTO)
  eligibilityCriteria?: string;
  status?: SchemeStatus;
}

/** Maps to SchemeResponseDto.java */
export interface SchemeResponse {
  schemeId: number;
  programId: number;
  programTitle: string;
  title: string;
  description?: string;
  budget: number;
  eligibilityCriteria?: string;
  status: SchemeStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Spring Data Page<T> wrapper.
 * Backend GET /programs and GET /schemes now return Page<T>.
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;           // current page (0-indexed)
  first: boolean;
  last: boolean;
  empty: boolean;
}
