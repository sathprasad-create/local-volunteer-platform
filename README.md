# Local Volunteer Platform

A web app that connects community organisers with local volunteers. Organisers post volunteering opportunities with a fixed number of places and decide who gets them. Volunteers browse open opportunities, apply, and track the outcome.

Built for IFQ636 Assignment 1 (QUT), extending the unit's MERN starter app.

## Roles

- **Volunteer**: anyone who registers. Browses opportunities, applies, withdraws.
- **Organiser**: set up by the platform operator, not self-registered. Creates opportunities and reviews applicants.

## Features

| Feature                                      | Persona                      |
| -------------------------------------------- | ---------------------------- |
| Register and log in                          | Volunteer                    |
| Seeded Organiser accounts                    | Platform operator, Organiser |
| Create, edit and close opportunities         | Organiser                    |
| Browse open opportunities                    | Volunteer                    |
| Apply for an opportunity                     | Volunteer                    |
| Approve or reject applicants within capacity | Organiser                    |
| View application status and withdraw         | Volunteer                    |

## Tech stack

Node.js 22, Express, MongoDB Atlas (Mongoose), React, Tailwind CSS, JWT authentication.

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

Run both servers:
```bash
npm run dev
```
Frontend: http://localhost:3000. Backend: http://localhost:5001.

## Project links

- Jira: SCRUM project(https://sathprasad.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)
- Figma: https://www.figma.com/design/lrvfojzaNrgngC8uV4DoP8/Local-Volunteer-Platform--IFQ636-A1-?node-id=26-71&t=NyLhM2MdoOdm7onR-1