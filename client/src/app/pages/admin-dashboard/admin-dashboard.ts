import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminService } from '../../core/admin.service';
import { getApiErrorMessage } from '../../core/api-error';
import { ApplicationService } from '../../core/application.service';
import { ApplicationStatus, Job, JobApplication, User } from '../../core/models';

interface Counts {
  users: number;
  jobs: number;
  applications: number;
  openJobs: number;
  submittedApplications: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {
  counts: Counts = {
    users: 0,
    jobs: 0,
    applications: 0,
    openJobs: 0,
    submittedApplications: 0
  };
  users: User[] = [];
  jobs: Job[] = [];
  applications: JobApplication[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(
    private readonly adminService: AdminService,
    private readonly applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';

    this.adminService.getDashboard().subscribe({
      next: ({ counts }) => {
        this.counts = counts;
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });

    this.adminService.getUsers().subscribe({
      next: ({ users }) => {
        this.users = users;
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });

    this.adminService.getJobs().subscribe({
      next: ({ jobs }) => {
        this.jobs = jobs;
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });

    this.adminService.getApplications()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ applications }) => {
          this.applications = applications;
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }

  toggleUser(user: User): void {
    this.adminService.updateUserStatus(user._id, !user.isActive).subscribe({
      next: ({ user: updated }) => {
        this.users = this.users.map((item) => item._id === updated._id ? updated : item);
        this.success = 'User status updated.';
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });
  }

  deleteJob(job: Job): void {
    this.adminService.deleteJob(job._id).subscribe({
      next: () => {
        this.success = 'Job deleted.';
        this.loadAll();
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });
  }

  updateApplicationStatus(application: JobApplication, status: string): void {
    this.applicationService.updateStatus(application._id, status as ApplicationStatus).subscribe({
      next: () => {
        this.success = 'Application status updated.';
        this.loadAll();
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
      }
    });
  }

  employerName(job: Job): string {
    return typeof job.employer === 'string' ? 'Unknown employer' : job.employer.name;
  }
}
