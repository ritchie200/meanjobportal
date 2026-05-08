import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApplicationStatus, JobApplication } from './models';

interface ApplyPayload {
  coverLetter?: string;
  resumeUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly apiUrl = `${environment.apiUrl}/applications`;

  constructor(private readonly http: HttpClient) {}

  apply(jobId: string, payload: ApplyPayload): Observable<{ application: JobApplication }> {
    return this.http.post<{ application: JobApplication }>(`${this.apiUrl}/jobs/${jobId}`, payload);
  }

  getMyApplications(): Observable<{ applications: JobApplication[] }> {
    return this.http.get<{ applications: JobApplication[] }>(`${this.apiUrl}/me`);
  }

  getEmployerApplications(filters: { jobId?: string; status?: string } = {}): Observable<{ applications: JobApplication[] }> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<{ applications: JobApplication[] }>(`${this.apiUrl}/employer`, { params });
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<{ application: JobApplication }> {
    return this.http.patch<{ application: JobApplication }>(`${this.apiUrl}/${id}/status`, { status });
  }
}
