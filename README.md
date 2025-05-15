# Capstone Projects Portal

The Capstone Projects Portal is a web portal that showcases projects built by students.
It is the basis of the [CMPUT 401 Projects Portal](https://cmput401.ca).

This repository contains the source code for the frontend and backend of the portal.

The frontend, written in TypeScript, is a single-page application built with React.
Vite is used as the build tool and development server.

The backend, written in Python, uses Django and Django REST framework. It stores data in a PostgreSQL database.
uv is used for dependency management.

## Setting up a development environment

### Dependencies

The Capstone Projects Portal development environment uses the following dependencies:

- [Python 3.11](https://www.python.org/downloads/), [uv 0.7.3](https://docs.astral.sh/uv/getting-started/installation/)
- [Node 24, npm 11](https://nodejs.org/en/download)
- [PostgreSQL 17](https://www.postgresql.org/download/)

### Dev container

A [dev container](https://code.visualstudio.com/docs/devcontainers/containers) is provided.
If you use VS Code and have Docker installed, this can be an easier way to set up a development environment.
It includes the appropriate versions of Python and Node, as well as a PostgreSQL container.

You do not have to use a dev container for your development environment. If you aren't using a dev container,
just ensure the appropriate versions of the above dependencies are installed and properly configured with the project.

To use the dev container, open the repo in VS Code and make sure Docker and the
[Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) is installed.
Press F1 and run the "Dev Containers: Reopen in Container" command. The terminal in VS Code will be attached
to the dev container, and a PostgreSQL container will be accessible on localhost:5432.

### Configuring the environment

[There are some environment variables that need to be set](docs/environment-variables.md)
for the backend and frontend to work. You can create `backend/.env` and `frontend/.env`
and set the needed environment variables there.

### Initial setup of development servers

> [!NOTE]
> If you are using a dev container for your development environment,
> make sure to run commands in the VS Code terminal attached to the dev container.

1. Ensure that `backend/.env` and `frontend/.env` exist and are configured according to the
   [Configuring the environment](#configuring-the-environment) section.

2. Run this command in the root of the repo to install all dependencies.
   This will install all Python and npm packages for the backend and frontend.

```
npm run install-all-dependencies
```

3. Initialize the backend database. Using the environment variables in `backend/.env`, this will
   connect to the PostgreSQL server, create the necessary database and user, and apply migrations.
   Note that if you re-run this command, existing data in the portal database will be lost.

```
npm run reset-database
```

4. Optionally, import test data into the database so the portal has some content.

```
npm run import-dummy-data
```

5. Optionally, create an admin user account on the portal.

```
cd backend && uv run python manage.py createsuperuser
```

### Other development environment setup

This project uses [pre-commit](https://pre-commit.com/) hooks to automatically check the code in the project
before you make a Git commit. It will use [Black](https://black.readthedocs.io/en/stable/) and
[flake8](https://github.com/pycqa/flake8) to format and lint Python on the backend, and [Biome](https://biomejs.dev/)
to lint and format TypeScript and CSS on the frontend.

To enable the pre-commit hooks and automatically check these issues when you make a commit, run the command
```
uv run pre-commit install
```

## Running development servers

To start both the backend and frontend dev servers concurrently, run this command in the root of the repo:

```
npm run start-servers
```

To start the frontend server individually, run this command in the root of the repo:

```
npm run start-frontend
```

To start the backend server individually, run this command in the root of the repo:

```
npm run start-backend
```

## Running tests

### Backend tests

Django unit tests are used for the backend.

To run just the backend tests, run this command in the root of the repo:

```
npm run test-backend
```

### Frontend tests

Vitest and React Testing Library is used for frontend unit tests, and Playwright is used
for end-to-end tests.

To run just the frontend unit tests, run this command:

```
cd frontend && npm run test:unit
```

> [!NOTE]
> To run end-to-end tests with Playwright, web browsers and their dependencies must be installed.
> They are already installed in the dev container, but you can install them on your system by running the command
> `npx playwright install --with-deps`. [See the Playwright docs for more information.](https://playwright.dev/docs/browsers)

To run just the end-to-end tests, run this command:

```
cd frontend && npm run test:e2e
```

To run both the frontend unit tests and the end-to-end tests, run this command in the root of the repo:

```
npm run test-frontend
```

### Running all tests

To run all tests for the backend and frontend, run this command in the root of the repo:

```
npm run test-all
```

## Building and deployment

[See this document](docs/deployment.md) for an outline of how the portal backend and frontend
could be deployed.

Alternatively, you can use an experimental [Docker Compose deployment](docs/docker-compose-deployment.md)
to more easily host the frontend, backend, and database all on the same server.

## Authors

Developers:

- Alisha Crasta
- Andrews Essilfie
- Ayo Akindele
- Kyle McLean
- Natasha Osmani
- Will Fenton

Instructors:

- Mohayeminul Islam (TA)
- Ildar Akhmetov

## License

This project is licensed under the MIT license.

It is an open-source project, as part of the University of Alberta's Student Open-Source Initiative.
