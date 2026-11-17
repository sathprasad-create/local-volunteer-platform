# Local Volunteer Platform

A web app that connects community organisers with local volunteers. Organisers post volunteering opportunities with a fixed number of places and decide who gets them. Volunteers browse open opportunities, apply, and track the outcome.

Built for IFQ636 Assignment 1 (QUT), extending the unit's MERN starter app.

## Deployment

The app runs on the university EC2 instance (Sath_t3, ap-southeast-2):

**http://&lt;instance public IPv4&gt;/** (at the time of writing: http://3.25.52.164/)

The public IP changes every time the instance is stopped and started, and the app keeps working at the new address without any change. Inbound access is limited to approved IPs, so the address is only reachable from those networks. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the runbook.

## Roles

- **Volunteer**: anyone who registers. Browses opportunities, applies, withdraws.
- **Organiser**: set up by the platform operator with a seed script, not self-registered. Creates opportunities and reviews applicants.

## Features

| Feature                                      | Persona                      |
| -------------------------------------------- | ---------------------------- |
| Register and log in                          | Volunteer                    |
| Seeded Organiser accounts                    | Platform operator, Organiser |
| Create, edit and close opportunities         | Organiser                    |
| Filter my opportunities by Open and Closed   | Organiser                    |
| Browse open opportunities                    | Volunteer                    |
| Apply for an opportunity                     | Volunteer                    |
| Approve or reject applicants within capacity | Organiser                    |
| See my applications and their status         | Volunteer                    |
| Withdraw an application before the event     | Volunteer                    |

## Architecture

```
Browser
  │  http://<public IP>/
  ▼
nginx on EC2 (port 80)
  ├── /        → React build in /var/www/lvp
  └── /api/    → Node.js + Express on 127.0.0.1:5001 (run by PM2)
                   │
                   ▼
              MongoDB Atlas (database: lvp)
```

- **Frontend** (`frontend/`): React with Tailwind. Calls `/api` relative to the host it was served from, so no IP or port is hard-coded. In development, the React dev server proxies `/api` to port 5001.
- **Backend** (`backend/`): Express, organised as routes → middleware → controllers → validators and utils → Mongoose models.
  - `middleware/authMiddleware.js`: `protect` checks the JWT and loads the user; `authorise(...roles)` returns 403 for the wrong role.
  - `utils/opportunityStatus.js`: an opportunity is closed when it was closed by hand or its close date has passed. Status is worked out on read, so no scheduler is needed.
  - Approving an application takes a place with one conditional update (`approvedCount < capacity`), so capacity can never be exceeded.
- **Data**: three collections: `users` (with role), `opportunities` and `applications` (one per volunteer per opportunity, enforced by a unique index). Nothing is deleted; closing sets `closedAt`.

### API

| Method | Path | Role | Purpose |
| ------ | ---- | ---- | ------- |
| POST | /api/auth/register | Public | Register a Volunteer |
| POST | /api/auth/login | Public | Log in; returns a token and role |
| GET | /api/auth/profile | Any | Own profile |
| POST | /api/opportunities | Organiser | Create an opportunity |
| GET | /api/opportunities/mine | Organiser | Own opportunities, `?status=open\|closed` |
| GET | /api/opportunities/:id | Organiser (owner) | One opportunity for editing |
| PUT | /api/opportunities/:id | Organiser (owner) | Edit |
| PATCH | /api/opportunities/:id/close | Organiser (owner) | Close |
| GET | /api/opportunities/:id/applications | Organiser (owner) | Applicants |
| GET | /api/opportunities | Volunteer | Browse open opportunities |
| GET | /api/opportunities/:id/view | Volunteer | One opportunity with own application status |
| POST | /api/opportunities/:id/applications | Volunteer | Apply |
| GET | /api/applications/mine | Volunteer | Own applications |
| PATCH | /api/applications/:id/decision | Organiser (owner) | Approve or reject |
| PATCH | /api/applications/:id/withdraw | Volunteer (own) | Withdraw |

## Tech stack

Node.js 22, Express, MongoDB Atlas (Mongoose), React, Tailwind CSS, JWT authentication, bcrypt, Mocha, Chai and Sinon, nginx and PM2 on AWS EC2.

## Local setup

Prerequisites: Node.js 22 (via nvm), a MongoDB Atlas cluster, Git.

```bash
git clone https://github.com/sathprasad-create/local-volunteer-platform.git
cd local-volunteer-platform
nvm use 22
npm run install-all
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
- `MONGO_URI`: your Atlas connection string, ending in `/lvp`
- `JWT_SECRET`: generate with `openssl rand -base64 32`
- `PORT`: 5001
- `SEED_ORGANISER_PASSWORD`: the password for the seeded Organiser accounts

Create the Organiser accounts (safe to run more than once):
```bash
npm run seed --prefix backend
```

Run both servers:
```bash
npm run dev
```
Frontend: http://localhost:3000. Backend: http://localhost:5001.

Your current IP must be on the Atlas access list, or the backend exits with a connection error.

## Tests

```bash
npm test --prefix backend
```
40 tests cover registration roles, role checks, opportunity validation, edit, close, browse, apply, review with the capacity limit, my applications and withdraw. The database is stubbed with Sinon, so no connection is needed.

## Known limitations

- **HTTP only.** There is no HTTPS, so traffic between the browser and the server is not encrypted.
- **Token in localStorage.** The login token is stored where any script on the page could read it (XSS risk).
- **Validation rules exist twice**, in the frontend and the backend, so a change must be made in both.
- **Dates are stored as midnight UTC.** An opportunity that "closes 26 Nov" closes at 11am Sydney time on that day.
- **Two-step writes.** Approve and withdraw update the application and the place count in two writes, not a transaction. Edit checks capacity against approvals in a separate step from saving.
- **Atlas access list allows 0.0.0.0/0** because the EC2 IP changes on every restart (decision D6). The app's database user can only read and write the `lvp` database.
- **One database for development and deployment.** Local runs and EC2 share the same Atlas database.
- **Seed script does not change passwords.** If `SEED_ORGANISER_PASSWORD` changes, existing Organiser accounts keep the old password.
- **Starter dependencies carry known audit findings** (`npm audit`), mostly from Create React App.
- **Deferred:** waitlist for full opportunities (S3.6) and removing the starter's unused profile fields (S1.3).

## Project links

- Jira: [SCRUM board](https://sathprasad.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)
- Figma: [Local Volunteer Platform prototype](https://www.figma.com/design/lrvfojzaNrgngC8uV4DoP8)
- Deployment runbook: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
