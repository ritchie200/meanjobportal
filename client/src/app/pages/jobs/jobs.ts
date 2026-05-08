import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { JobService } from '../../core/job.service';
import { Job, Pagination } from '../../core/models';

@Component({
  selector: 'app-jobs',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './jobs.html'
})
export class Jobs implements OnInit {
  private readonly fb = inject(FormBuilder);

  jobs: Job[] = [];
  pagination: Pagination = { page: 1, limit: 8, total: 0, pages: 1 };
  loading = false;
  error = '';

  readonly searchForm = this.fb.nonNullable.group({
    search: [''],
    location: [''],
    employmentType: ['']
  });

  constructor(
    private readonly jobService: JobService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(page = 1): void {
    this.loading = true;
    this.error = '';

    this.jobService.listJobs({
      ...this.searchForm.getRawValue(),
      page,
      limit: this.pagination.limit
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ jobs, pagination }) => {
          this.jobs = jobs;
          this.pagination = pagination;
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }

  reset(): void {
    this.searchForm.reset({ search: '', location: '', employmentType: '' });
    this.loadJobs();
  }

  salary(job: Job): string {
    if (!job.salaryMin && !job.salaryMax) {
      return 'Salary not listed';
    }

    return `${job.salaryMin || 0} - ${job.salaryMax || 'open'}`;
  }
}
