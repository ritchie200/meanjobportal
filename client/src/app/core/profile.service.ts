import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CandidateProfile, EmployerProfile, User } from './models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  constructor(private readonly http: HttpClient) {}

  getCandidateProfile(): Observable<{ profile: CandidateProfile }> {
    return this.http.get<{ profile: CandidateProfile }>(`${this.apiUrl}/candidate`);
  }

  updateCandidateProfile(payload: CandidateProfile): Observable<{ profile: CandidateProfile; user: User }> {
    return this.http.put<{ profile: CandidateProfile; user: User }>(`${this.apiUrl}/candidate`, payload);
  }

  getEmployerProfile(): Observable<{ profile: EmployerProfile }> {
    return this.http.get<{ profile: EmployerProfile }>(`${this.apiUrl}/employer`);
  }

  updateEmployerProfile(payload: EmployerProfile): Observable<{ profile: EmployerProfile; user: User }> {
    return this.http.put<{ profile: EmployerProfile; user: User }>(`${this.apiUrl}/employer`, payload);
  }
}
