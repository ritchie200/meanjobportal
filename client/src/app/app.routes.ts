import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth.guard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { CandidateDashboard } from './pages/candidate-dashboard/candidate-dashboard';
import { EmployerDashboard } from './pages/employer-dashboard/employer-dashboard';
import { JobDetail } from './pages/job-detail/job-detail';
import { Jobs } from './pages/jobs/jobs';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' },
  { path: 'jobs', component: Jobs },
  { path: 'jobs/:id', component: JobDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'candidate',
    component: CandidateDashboard,
    canActivate: [authGuard, roleGuard(['candidate'])]
  },
  {
    path: 'employer',
    component: EmployerDashboard,
    canActivate: [authGuard, roleGuard(['employer'])]
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  { path: '**', redirectTo: 'jobs' }
];
