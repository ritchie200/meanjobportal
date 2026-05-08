# MEAN Job Portal

This is a MEAN stack job portal MVP built with MongoDB, Express, Angular, and Node.js. It covers the basic flows a small job platform needs: candidates can create profiles and apply for jobs, employers can post jobs and review applications, and admins can manage the platform data.

I built it as a portfolio project to show a full-stack app with authentication, role-based access, CRUD APIs, Angular routing, forms, and a clean project structure. It is intentionally simple enough to run locally and read through without needing cloud services.

## Main user roles

- Candidate: register, maintain a profile, search jobs, apply, and view application history.
- Employer: register a company account, maintain company profile, post/manage jobs, and review applications.
- Admin: login with an admin account and manage users, jobs, and applications.

Admin registration is not exposed publicly. For local testing, create an admin user with the helper script after MongoDB is configured.

## Features

- JWT authentication
- bcrypt password hashing
- Role-based authorization for candidate, employer, and admin routes
- Candidate and employer profile management
- Employer job posting CRUD
- Public job listing with search, filters, and pagination
- Job detail page with candidate application form
- Candidate application history
- Employer application review with status updates
- Admin dashboard for users, jobs, and applications
- Angular auth guards, services, reactive forms, loading states, and validation messages
- Centralized Express error handling and request validation

## Tech stack

- Frontend: Angular 21, Angular Router, Reactive Forms, HttpClient
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Auth: JWT, bcryptjs
- Validation: express-validator

## Technical notes

The backend is split into the usual Express layers: routes only describe the HTTP endpoints, controllers hold the request logic, models define the MongoDB shape, and middleware handles auth, role checks, validation, and errors. I kept it this way so the project is easy to extend without having one large server file.

Authentication is token based. When a user logs in, the API signs a JWT with the user id and role. The Angular app stores the token in local storage and sends it on API calls through an HTTP interceptor. Protected backend routes use `protect` to verify the token and `authorize(...)` to check roles.

Passwords are never stored as plain text. The `User` model hashes passwords with bcrypt before saving, and login compares the submitted password against that hash.

The main MongoDB collections are:

- `users`: candidate, employer, and admin accounts. Candidate and employer profile data live on the same user document because this MVP does not need separate profile ownership rules yet.
- `jobs`: jobs posted by employers. Each job stores the employer id, company name, skills, status, salary range, location, and employment type.
- `applications`: one application per candidate per job. There is a unique index on `job + candidate` to stop duplicate applications.

Job search is handled with MongoDB query filters. The API supports keyword search across title, description, company, location, and skills, plus location/type filters and pagination. This is enough for a local MVP. For a larger app I would move this to a better search setup.

The frontend uses standalone Angular components. Shared API code is in `client/src/app/core`, and routed screens are in `client/src/app/pages`. Forms are reactive forms, so validation state stays close to each screen and is easy to adjust.

## Backend details

Important backend files:

- `server/src/app.js`: Express app setup, middleware, and route registration.
- `server/src/server.js`: database connection and app startup.
- `server/src/config/db.js`: Mongoose connection.
- `server/src/middleware/authMiddleware.js`: JWT verification and role authorization.
- `server/src/middleware/validateRequest.js`: express-validator result handling.
- `server/src/middleware/errorMiddleware.js`: centralized error responses.
- `server/src/models/User.js`: user account plus candidate/employer profile fields.
- `server/src/models/Job.js`: employer job posts and search indexes.
- `server/src/models/Application.js`: candidate applications and review status.

The API returns JSON only. Validation errors come back as a `message` plus an `errors` array when field-level validation fails. Other errors use a simple `{ message }` response. In development, the stack trace is included by the error middleware.

The backend intentionally does not include a real MongoDB connection string. Use `server/.env` locally and keep it out of git.

## Frontend details

Important frontend files:

- `client/src/app/app.routes.ts`: route map and role-protected dashboard routes.
- `client/src/app/core/auth.service.ts`: login, register, logout, token storage, and current user state.
- `client/src/app/core/auth.interceptor.ts`: attaches the bearer token to API requests.
- `client/src/app/core/auth.guard.ts`: blocks unauthenticated users and redirects users away from dashboards they should not access.
- `client/src/app/core/job.service.ts`: job search and employer job CRUD calls.
- `client/src/app/core/application.service.ts`: apply, application history, and status updates.
- `client/src/app/core/admin.service.ts`: admin dashboard API calls.
- `client/src/environments/environment.ts`: frontend API base URL.

The UI is kept fairly plain on purpose. It has enough layout, loading states, validation messages, and error handling to be usable, but it avoids pretending to be a finished production product.

## Project structure

```text
.
|-- client/                  # Angular app
|   `-- src/app/
|       |-- core/            # models, services, guards, auth interceptor
|       `-- pages/           # routed screens
|-- server/                  # Express API
|   `-- src/
|       |-- config/          # env and database setup
|       |-- controllers/     # route handlers
|       |-- middleware/      # auth, validation, error handling
|       |-- models/          # Mongoose models
|       |-- routes/          # API routes
|       `-- utils/
|-- .env.example
|-- package.json             # root convenience scripts
`-- README.md
```

## Setup

Use an active Node.js LTS release if possible. The app was scaffolded with Angular 21, and Angular may warn if you run an odd-numbered non-LTS Node version.

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Create a local environment file. You can place it at `server/.env`:

```bash
cp .env.example server/.env
```

3. Fill in the values in `server/.env`. The committed example is intentionally only placeholders:

```env
# MONGO_URI=your_mongodb_connection_string_here
# JWT_SECRET=replace_with_your_secret
# PORT=5000
```

Uncomment the lines in your local `.env` file and replace the values. Do not commit `.env`.

4. Start the app:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default. The Angular app runs on `http://localhost:4200`.

5. Create an admin account when you need to test the admin dashboard:

```bash
npm --prefix server run create-admin -- "Admin User" admin@example.com "change-this-password"
```

## Useful scripts

From the project root:

```bash
npm run dev          # start backend and frontend together
npm run server       # start only the Express API with nodemon
npm run client       # start only Angular
npm run build        # build the Angular app
npm run install:all  # install server and client dependencies
```

From `server/`:

```bash
npm run start
npm run dev
npm run create-admin -- "Admin User" admin@example.com "change-this-password"
```

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET|PUT /api/profile/candidate`
- `GET|PUT /api/profile/employer`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/jobs/employer/mine`
- `POST /api/jobs`
- `PUT|DELETE /api/jobs/:id`
- `POST /api/applications/jobs/:jobId`
- `GET /api/applications/me`
- `GET /api/applications/employer`
- `PATCH /api/applications/:id/status`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/jobs`
- `DELETE /api/admin/jobs/:id`
- `GET /api/admin/applications`

## Example API payloads

Register a candidate:

```json
{
  "name": "Candidate User",
  "email": "candidate@example.com",
  "password": "password123",
  "role": "candidate"
}
```

Register an employer:

```json
{
  "name": "Recruiter User",
  "email": "recruiter@example.com",
  "password": "password123",
  "role": "employer",
  "companyName": "Acme Software"
}
```

Create a job as an employer:

```json
{
  "title": "Angular Developer",
  "description": "Build and maintain Angular features for the company dashboard.",
  "companyName": "Acme Software",
  "location": "Remote",
  "employmentType": "Full-time",
  "salaryMin": 60000,
  "salaryMax": 90000,
  "skills": ["Angular", "TypeScript", "REST APIs"],
  "status": "open"
}
```

Apply to a job as a candidate:

```json
{
  "resumeUrl": "https://example.com/resume.pdf",
  "coverLetter": "I have worked with Angular and Node.js and would like to apply for this role."
}
```

## Known limitations

- There is no file upload service. Resume links are stored as URLs.
- Admin user creation uses a local helper script instead of a full invite flow.
- There is no email verification or password reset flow.
- Search is basic MongoDB filtering, not a dedicated search engine.
- The UI is focused on MVP workflows, not advanced recruiter workflows.
- There are no automated tests yet.

## Future improvements

- Add seed scripts for demo users and sample jobs.
- Add automated API and Angular component tests.
- Add password reset and email verification.
- Add resume upload through S3, Cloudinary, or a similar service.
- Add saved jobs and candidate shortlists.
- Add richer admin audit logs.
- Add deployment notes for Render/Railway/Vercel or similar platforms.

## Manual testing checklist

- Register a candidate and confirm the candidate dashboard opens.
- Update the candidate profile and reload the page.
- Register an employer and update the company profile.
- Post a job as the employer.
- Search for the job on the public jobs page.
- Open the job detail page as a candidate and submit an application.
- Confirm the application appears in the candidate dashboard.
- Login as the employer and update the application status.
- Login as an admin and confirm users, jobs, and applications are listed.
- Disable and re-enable a user from the admin dashboard.
- Delete a job from the admin dashboard and confirm its applications are removed.
