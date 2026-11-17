# Local Volunteer Platform

A web app that connects community organisers with local volunteers. Organisers post volunteering opportunities with a set number of places and choose who gets them. Volunteers browse open opportunities, apply, and see the outcome.

Built for IFQ636 Assignment 1 (QUT), extending the unit's MERN starter app.

## Where it runs

The app runs on my university EC2 instance at **http://&lt;instance public IP&gt;/** (on 17 Nov 2026 this was http://3.25.52.164/).

The IP changes each time the instance restarts, but the app keeps working at the new address with no changes. Access is limited to approved IP addresses. How it was deployed: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Roles

- **Volunteer**: anyone who registers. Browses opportunities, applies, withdraws.
- **Organiser**: created by the platform operator with a seed script, not by registering. Creates opportunities and reviews applicants.

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

The SysML diagrams are in [docs/design/LVP_SysML.drawio](docs/design/LVP_SysML.drawio). Open the file in diagrams.net. It has three pages: requirements, system structure, and the application lifecycle.

In short:
- The **React frontend** is what users see in the browser.
- The **Express backend** handles logins and the rules, such as roles, capacity and close dates.
- **MongoDB Atlas** stores users, opportunities and applications.
- On EC2, **nginx** serves the frontend and passes `/api` requests to the backend. **PM2** keeps the backend running and starts it again after a restart.

## Tech stack

Node.js 22, Express, MongoDB Atlas, React, Tailwind CSS, JWT login, Mocha, Chai and Sinon for tests, nginx and PM2 on AWS EC2.

## Run it locally

You need Node.js 22, a MongoDB Atlas cluster and Git.

```bash
git clone https://github.com/sathprasad-create/local-volunteer-platform.git
cd local-volunteer-platform
nvm use 22
npm run install-all
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:
- `MONGO_URI`: your Atlas connection string, ending in `/lvp`
- `JWT_SECRET`: make one with `openssl rand -base64 32`
- `PORT`: 5001
- `SEED_ORGANISER_PASSWORD`: a password for the Organiser accounts

Create the Organiser accounts:
```bash
npm run seed --prefix backend
```

Start the app:
```bash
npm run dev
```
Open http://localhost:3000. Your IP must be on the Atlas access list.

## Tests

```bash
npm test --prefix backend
```
40 backend tests. They fake the database, so no connection is needed.

## Known limitations

- No HTTPS. The site uses plain HTTP.
- The login token is kept in the browser's localStorage, which page scripts can read.
- Form rules are written twice, once in the frontend and once in the backend.
- Dates are saved as midnight UTC, so an opportunity that closes on 26 Nov actually closes at 11am Sydney time that day.
- Approving and withdrawing each make two separate database updates, not one combined transaction.
- Atlas accepts connections from any IP, because the EC2 IP changes on restart. The app's database user can only use the `lvp` database.
- Local runs and EC2 use the same database.
- Changing the seed password does not update Organiser accounts that already exist.
- Some starter packages have known security warnings from `npm audit`.
- Not built yet: a waitlist for full opportunities, and removing unused profile fields from the starter.

## Links

- Jira: [SCRUM board](https://sathprasad.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)
- Figma: [prototype](https://www.figma.com/design/lrvfojzaNrgngC8uV4DoP8)
- Deployment: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
