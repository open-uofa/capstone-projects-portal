# Backend environment variables

For backend deployment and development environments, the following environment variables
should be set. They can be set by creating the file `backend/.env` and adding the following
contents.

> [!NOTE]
> In production environments, do not include the variables in the "DEVELOPMENT VARIABLES" section.

> [!IMPORTANT]
> The `DJANGO_SECRET_KEY` variable must be set to a random value for the backend to work and be secure.
> Execute the provided command to generate a suitable value, and put it in between the double-quotes after `DJANGO_SECRET_KEY=`.

```shell
# Generate a secret key for the backend by running this command:
#     uv run python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DJANGO_SECRET_KEY=""

# The base URL that the frontend will be accessible at.
FRONTEND_BASE_URL=http://localhost:3000

# These are the PostgreSQL database credentials used for the portal backend.
PORTAL_DB_DATABASE=portal
PORTAL_DB_USER=portal
PORTAL_DB_PASSWORD=portal
PORTAL_DB_HOST=localhost
PORTAL_DB_PORT=5432

# If you want GitHub login to work, set these environment variables according
# to the details for your GitHub OAuth app.
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# If you want the backend server to send emails, set these environment variables
# to the appropriate SMTP credentials.
EMAIL_HOST=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=

# The reset-database script will connect to the PostgreSQL server specified by
# PORTAL_DB_HOST and PORTAL_DB_PORT and will use the following credentials to
# create the database and user specified with PORTAL_DB_DATABASE,
# PORTAL_DB_USER, and PORTAL_DB_PASSWORD.
#
# These will also be used as the default database, username, and password
# for the PostgreSQL container in the Docker Compose production deployment.
PG_CONNECT_DATABASE=postgres
PG_CONNECT_USER=postgres
PG_CONNECT_PASSWORD=postgres

##########################################################################
##########################################################################
###                                                                    ###
###  DEVELOPMENT VARIABLES                                             ###
###                                                                    ###
###  The environment variables below are only relevant in development  ###
###  environments. Remove them in production environments.             ###
###                                                                    ###
##########################################################################
##########################################################################

DJANGO_DEBUG=1

##########################################################################
##########################################################################
###                                                                    ###
###  END DEVELOPMENT VARIABLES                                         ###
###                                                                    ###
##########################################################################
##########################################################################
```

# Frontend environment variables

For frontend deployment and development environments, the following environment variables
should be set. They can be set by creating the file `frontend/.env` and adding the following
contents.

```shell
# The base URL for the backend API.
# In the development environment, this runs on a separate origin from the frontend -- locally on port 8000.
# In the recommended production environment, this can be set to /api as it is hosted on the same origin.
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# The URL for the backend admin panel.
# In the development environment, this runs on a separate origin from the frontend -- locally on port 8000.
# In the recommended production environment, this can be set to /admin as it is hosted on the same origin.
VITE_ADMIN_URL=http://127.0.0.1:8000/admin

# If you want GitHub login to work, set this to the client ID of the GitHub OAuth app.
# It should be the same as the GITHUB_CLIENT_ID environment variable set on the backend.
VITE_GITHUB_CLIENT_ID=
```
