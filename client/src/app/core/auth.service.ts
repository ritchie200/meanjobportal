import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User, UserRole } from './models';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'candidate' | 'employer';
  companyName?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'mean_job_portal_token';
  private readonly userKey = 'mean_job_portal_user';
  private readonly currentUserSignal = signal<User | null>(this.restoreUser());

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => this.setSession(response))
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => this.setSession(response))
    );
  }

  refreshMe(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      tap(({ user }) => this.updateUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSignal.set(null);
  }

  updateUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  isAuthenticated(): boolean {
    return Boolean(this.token && this.currentUser());
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return Boolean(user && roles.includes(user.role));
  }

  redirectPathForRole(role: UserRole): string {
    if (role === 'candidate') {
      return '/candidate';
    }

    if (role === 'employer') {
      return '/employer';
    }

    return '/admin';
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    this.updateUser(response.user);
  }

  private restoreUser(): User | null {
    const rawUser = localStorage.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
