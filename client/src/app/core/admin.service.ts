import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Job, JobApplication, User } from './models';

interface AdminCounts {
  users: number;
  jobs: number;
  applications: number;
  openJobs: number;
  submittedApplications: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<{ counts: AdminCounts }> {
    return this.http.get<{ counts: AdminCounts }>(`${this.apiUrl}/dashboard`);
  }

  getUsers(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(`${this.apiUrl}/users`);
  }

  updateUserStatus(id: string, isActive: boolean): Observable<{ user: User }> {
    return this.http.patch<{ user: User }>(`${this.apiUrl}/users/${id}/status`, { isActive });
  }

  getJobs(): Observable<{ jobs: Job[] }> {
    return this.http.get<{ jobs: Job[] }>(`${this.apiUrl}/jobs`);
  }

  deleteJob(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/jobs/${id}`);
  }

  getApplications(): Observable<{ applications: JobApplication[] }> {
    return this.http.get<{ applications: JobApplication[] }>(`${this.apiUrl}/applications`);
  }
}
