export type UserRole = 'candidate' | 'employer' | 'admin';
export type JobStatus = 'open' | 'closed';
export type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';

export interface CandidateProfile {
  phone?: string;
  location?: string;
  headline?: string;
  skills?: string[];
  resumeUrl?: string;
  experience?: string;
}

export interface EmployerProfile {
  companyName?: string;
  website?: string;
  industry?: string;
  location?: string;
  description?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  candidateProfile?: CandidateProfile;
  employerProfile?: EmployerProfile;
  createdAt?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  employer: User | string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  status: JobStatus;
  createdAt?: string;
}

export interface JobApplication {
  _id: string;
  job: Job;
  candidate: User;
  employer: User;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  createdAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: ValidationError[];
}
