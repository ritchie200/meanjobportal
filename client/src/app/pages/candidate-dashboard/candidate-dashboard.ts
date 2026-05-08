import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { ApplicationService } from '../../core/application.service';
import { AuthService } from '../../core/auth.service';
import { JobApplication } from '../../core/models';
import { ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-candidate-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './candidate-dashboard.html'
})
export class CandidateDashboard implements OnInit {
  private readonly fb = inject(FormBuilder);

  applications: JobApplication[] = [];
  loadingProfile = false;
  loadingApplications = false;
  saving = false;
  error = '';
  success = '';

  readonly profileForm = this.fb.nonNullable.group({
    phone: [''],
    location: [''],
    headline: [''],
    skills: [''],
    resumeUrl: [''],
    experience: ['']
  });

  constructor(
    private readonly auth: AuthService,
    private readonly profileService: ProfileService,
    private readonly applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadApplications();
  }

  loadProfile(): void {
    this.loadingProfile = true;
    this.error = '';

    this.profileService.getCandidateProfile()
      .pipe(finalize(() => (this.loadingProfile = false)))
      .subscribe({
        next: ({ profile }) => {
          this.profileForm.patchValue({
            phone: profile.phone || '',
            location: profile.location || '',
            headline: profile.headline || '',
            skills: profile.skills?.join(', ') || '',
            resumeUrl: profile.resumeUrl || '',
            experience: profile.experience || ''
          });
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }

  saveProfile(): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    const value = this.profileForm.getRawValue();

    this.profileService.updateCandidateProfile({
      ...value,
      skills: this.splitList(value.skills)
    })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: ({ user }) => {
          this.auth.updateUser(user);
          this.success = 'Profile saved.';
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }

  loadApplications(): void {
    this.loadingApplications = true;

    this.applicationService.getMyApplications()
      .pipe(finalize(() => (this.loadingApplications = false)))
      .subscribe({
        next: ({ applications }) => {
          this.applications = applications;
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }

  private splitList(value: string): string[] {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}
