# Deployment with Docker Compose

An experimental deployment configuration has been created using Docker Compose.
Using this configuration, you can easily deploy the Capstone Projects Portal frontend, backend, and database on the same server by running just a few commands.

The [docker-compose.yml](/docker-compose.yml) file in the root of this repository contains the configuration. It consists of three services:
- `db`: a PostgreSQL database that stores application data
- `backend`: the backend Django server, running on Gunicorn, which hosts the API and admin panel
- `caddy`: a user-facing Caddy reverse proxy that serves static frontend and backend assets and user uploads, and routes API and admin panel requests to the backend server

For more details on deployment, such as setting up emails and GitHub OAuth, see the [deployment documentation page](deployment.md).

## Steps to deploy

1. Connect to the server.

2. Ensure that Docker and Docker Compose are installed on the server.

3. Clone the Capstone Projects Portal repository to the server.
```
git clone https://github.com/open-uofa/capstone-projects-portal.git
```

4. Switch to the repository directory.
```
cd capstone-projects-portal
```

5. Create a `.deploy.env` file in the repository directory, and populate it with the frontend and backend [production environment variables](environment-variables.md). At minimum, set the following environment variables:

- `DJANGO_SECRET_KEY`: set to a random value according to [the documentation](environment-variables.md). It may be easiest to generate it in your local development environment.
- `FRONTEND_BASE_URL`: set to the origin the app will be hosted on. For example: https://cmput401.ca

6. In the repository directory, build and start the containers.
```
docker compose --env-file .deploy.env up --build -d
```

7. To initialize the database, you need to create the appropriate database and user on the PostgreSQL container, and apply the database migrations.
You can do this by running the command
```
docker exec -it portal-backend sh -c "uv run /app/backend/scripts/setup_db.py && uv run /app/backend/manage.py migrate"
```

8. To create an admin user account, run the command
```
docker exec -it portal-backend sh -c "uv run /app/backend/manage.py createsuperuser"
```
and follow the directions.

The app should now be running!

## Steps to update

To update the deployed app with new changes to the Capstone Project Portal code, follow these steps.

1. Run `git pull` to download the new code.

2. Stop the running servers.
```
docker compose down
```

3. Rebuild and restart the containers.
```
docker compose --env-file .deploy.env up --build -d
```

4. Apply any database migrations.
```
docker exec -it portal-backend sh -c "uv run /app/backend/manage.py migrate"
```
