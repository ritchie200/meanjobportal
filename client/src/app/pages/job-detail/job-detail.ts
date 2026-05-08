import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { ApplicationService } from '../../core/application.service';
import { AuthService } from '../../core/auth.service';
import { JobService } from '../../core/job.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-job-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './job-detail.html'
})
export class JobDetail implements OnInit {
  private readonly fb = inject(FormBuilder);

  job?: Job;
  loading = false;
  applying = false;
  error = '';
  success = '';

  readonly applyForm = this.fb.nonNullable.group({
    resumeUrl: [''],
    coverLetter: ['']
  });

  constructor(
    public readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly jobService: JobService,
    private readonly applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.loadJob();
  }

  get canApply(): boolean {
    return this.auth.currentUser()?.role === 'candidate' && this.job?.status === 'open';
  }

  loadJob(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Job id is missing.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.jobService.getJob(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ job }) => {
          this.job = job;
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }

  apply(): void {
    if (!this.job) {
      return;
    }

    this.applying = true;
    this.error = '';
    this.success = '';

    this.applicationService.apply(this.job._id, this.applyForm.getRawValue())
      .pipe(finalize(() => (this.applying = false)))
      .subscribe({
        next: () => {
          this.success = 'Application submitted.';
          this.applyForm.reset({ resumeUrl: '', coverLetter: '' });
        },
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }
}
