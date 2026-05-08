import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Job, Pagination } from './models';

interface JobListParams {
  search?: string;
  location?: string;
  employmentType?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export type JobPayload = Omit<Job, '_id' | 'employer' | 'createdAt' | 'skills'> & {
  skills?: string[] | string;
};

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private readonly http: HttpClient) {}

  listJobs(params: JobListParams): Observable<{ jobs: Job[]; pagination: Pagination }> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<{ jobs: Job[]; pagination: Pagination }>(this.apiUrl, { params: httpParams });
  }

  getJob(id: string): Observable<{ job: Job }> {
    return this.http.get<{ job: Job }>(`${this.apiUrl}/${id}`);
  }

  getEmployerJobs(): Observable<{ jobs: Job[] }> {
    return this.http.get<{ jobs: Job[] }>(`${this.apiUrl}/employer/mine`);
  }

  createJob(payload: JobPayload): Observable<{ job: Job }> {
    return this.http.post<{ job: Job }>(this.apiUrl, payload);
  }

  updateJob(id: string, payload: JobPayload): Observable<{ job: Job }> {
    return this.http.put<{ job: Job }>(`${this.apiUrl}/${id}`, payload);
  }

  deleteJob(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
