import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { ApplicationService } from '../../core/application.service';
import { AuthService } from '../../core/auth.service';
import { JobPayload, JobService } from '../../core/job.service';
import { ApplicationStatus, Job, JobApplication } from '../../core/models';
import { ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-employer-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './employer-dashboard.html'
})
export class EmployerDashboard implements OnInit {
  private readonly fb = inject(FormBuilder);

  jobs: Job[] = [];
  applications: JobApplication[] = [];
  editingJobId: string | null = null;
  loading = false;
  savingProfile = false;
  savingJob = false;
  error = '';
  success = '';

  readonly profileForm = this.fb.nonNullable.group({
    companyName: ['', Validators.required],
    website: [''],
    industry: [''],
    location: [''],
    description: ['']
  });

  readonly jobForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    companyName: [''],
    location: ['', Validators.required],
    employmentType: ['Full-time'],
    salaryMin: [''],
    salaryMax: [''],
    skills: [''],
    status: ['open']
  });

  constructor(
    private readonly auth: AuthService,
    private readonly profileService: ProfileService,
    private readonly jobService: JobService,
    private readonly applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';

    this.profileService.getEmployerProfile().subscribe({
      next: ({ profile }) => this.profileForm.patchValue({
        companyName: profile.companyName || '',
        website: profile.website || '',
        industry: profile.industry || '',
        location: profile.location || '',
        description: profile.description || ''
      }),
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });

    this.jobService.getEmployerJobs().subscribe({
      next: ({ jobs }) => {
        this.jobs = jobs;
        this.loading = false;
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
        this.loading = false;
      }
    });

    this.loadApplications();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile = true;
    this.error = '';
    this.success = '';

    this.profileService.updateEmployerProfile(this.profileForm.getRawValue())
      .pipe(finalize(() => (this.savingProfile = false)))
      .subscribe({
        next: ({ user }) => {
          this.auth.updateUser(user);
          this.success = 'Company profile saved.';
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }

  saveJob(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    const request = this.editingJobId
      ? this.jobService.updateJob(this.editingJobId, this.jobPayload())
      : this.jobService.createJob(this.jobPayload());

    this.savingJob = true;
    this.error = '';
    this.success = '';

    request
      .pipe(finalize(() => (this.savingJob = false)))
      .subscribe({
        next: () => {
          this.success = this.editingJobId ? 'Job updated.' : 'Job posted.';
          this.resetJobForm();
          this.loadJobs();
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }

  editJob(job: Job): void {
    this.editingJobId = job._id;
    this.jobForm.patchValue({
      title: job.title,
      description: job.description,
      companyName: job.companyName,
      location: job.location,
      employmentType: job.employmentType,
      salaryMin: job.salaryMin ? String(job.salaryMin) : '',
      salaryMax: job.salaryMax ? String(job.salaryMax) : '',
      skills: job.skills.join(', '),
      status: job.status
    });
  }

  deleteJob(job: Job): void {
    this.jobService.deleteJob(job._id).subscribe({
      next: () => {
        this.success = 'Job deleted.';
        this.loadJobs();
        this.loadApplications();
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });
  }

  updateStatus(application: JobApplication, status: string): void {
    this.applicationService.updateStatus(application._id, status as ApplicationStatus).subscribe({
      next: () => this.loadApplications(),
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });
  }

  resetJobForm(): void {
    this.editingJobId = null;
    this.jobForm.reset({
      title: '',
      description: '',
      companyName: this.profileForm.controls.companyName.value,
      location: '',
      employmentType: 'Full-time',
      salaryMin: '',
      salaryMax: '',
      skills: '',
      status: 'open'
    });
  }

  private loadJobs(): void {
    this.jobService.getEmployerJobs().subscribe({
      next: ({ jobs }) => {
        this.jobs = jobs;
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });
  }

  private loadApplications(): void {
    this.applicationService.getEmployerApplications().subscribe({
      next: ({ applications }) => {
        this.applications = applications;
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });
  }

  private jobPayload(): JobPayload {
    const value = this.jobForm.getRawValue();
    const salaryMin = Number(value.salaryMin);
    const salaryMax = Number(value.salaryMax);

    return {
      title: value.title,
      description: value.description,
      companyName: value.companyName || this.profileForm.controls.companyName.value,
      location: value.location,
      employmentType: value.employmentType as JobPayload['employmentType'],
      salaryMin: Number.isFinite(salaryMin) && value.salaryMin !== '' ? salaryMin : undefined,
      salaryMax: Number.isFinite(salaryMax) && value.salaryMax !== '' ? salaryMax : undefined,
      skills: value.skills.split(',').map((item) => item.trim()).filter(Boolean),
      status: value.status as JobPayload['status']
    };
  }
}
