# Deployment

This guide covers how to deploy the CMPUT 401 project portal. It is based on
[this tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-20-04)
from DigitalOcean, so if you are running into issues it may be a good resource.

## Assumptions

This guide was written with the following assumptions. If they do not hold, you will likely have to make some
modifications to the steps.

1. The instance is fresh (existing software could interfere)
2. The instance is running Ubuntu 20.04 with an x86 processor (what we tested with)
3. The instance has a public IP and the domain `cmput401.ca` is setup to point to it.

If you're not using Ubuntu, you will at least have to change any references to the home directory (`/home/ubuntu`), and
likely any `apt` package manager commands.

## Setup

1. Update software

```shell
sudo apt update && sudo apt upgrade && sudo apt autoremove
```

2. Install dependencies

```shell
sudo apt install python3-dev python3-pip pipenv libpq-dev postgresql postgresql-contrib nginx curl npm
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install python3.9
```

## Initial Deploy

1. Clone the repository to `~/cmput401-portal`

```shell
# to clone with SSH, generate an SSH key on your instance and add it as a deploy key in the repo settings
# otherwise, you can clone with HTTPS using a personal access token
git clone git@github.com:UAlberta-CMPUT401/cmput401-portal.git ~/cmput401-portal
```

2. Install project dependencies

```shell
cd ~/cmput401-portal/

# install python dependencies
pipenv install

# install root node packages
npm install

# install frontend node packages
cd frontend/ && npm install && cd -
```

3. Change the password of the default postgres user

```shell
sudo -u postgres psql

# save the password for later
postgres=# \password postgres

# exit (ctrl+D)
```

4. Change postgres authentication from peer to
   md5 ([source](https://stackoverflow.com/questions/18664074/getting-error-peer-authentication-failed-for-user-postgres-when-trying-to-ge))

```shell
sudo sed -i 's/peer/md5/' /etc/postgresql/*/main/pg_hba.conf
sudo service postgresql restart
```

5. Generate a Django secret key

```shell
pipenv run python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

6. Create the file `~/cmput401-portal/backend/.env` with the following contents

```shell
# Name of database to connect to
PG_CONNECT_DATABASE=postgres
# Name of user to connect with
PG_CONNECT_USER=postgres
# Password of user to connect with
PG_CONNECT_PASSWORD=<password you set earlier>

# Name of database to create
PORTAL_DB_DATABASE=portal
# Name of user to create
PORTAL_DB_USER=portaluser
# Password of user to create
PORTAL_DB_PASSWORD=<new password>

DJANGO_SECRET_KEY=<secret key you generated earlier>

# URL template for account activations (used for account activation emails)
ACTIVATION_URL_TEMPLATE=http://cmput401.ca/activate/{activation_key}
# URL template for password resets (used for password reset emails)
RESET_PASSWORD_URL_TEMPLATE=http://cmput401.ca/reset-password/{reset_key}
```

7. Setup the postgres DB

```shell
pipenv run python backend/scripts/setup_db.py --reset
```

8. Setup Django

```shell
cd ~/cmput401-portal/backend/

# apply migrations
pipenv run python manage.py migrate

# create admin account
pipenv run python manage.py createsuperuser

# collect static files
pipenv run python manage.py collectstatic
```

9. Build the website (takes a while)

```shell
cd ~/cmput401-portal/frontend/
npm run build
```

10. Create the file `/etc/systemd/system/gunicorn.socket` as superuser with the following contents

```
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
```

11. Copy the gunicorn service file

```shell
sudo cp ~/cmput401-portal/deployment/gunicorn.service /etc/systemd/system/gunicorn.service
```

12. Start gunicorn

```shell
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
```

13. Setup nginx

```shell
# copy portal site config file
sudo cp ~/cmput401-portal/deployment/portal-site /etc/nginx/sites-available/portal

# enable the site
sudo ln -s /etc/nginx/sites-available/portal /etc/nginx/sites-enabled

# disable the default nginx site
sudo rm /etc/nginx/sites-enabled/default

sudo systemctl restart nginx
```

Done! 🎉🎊🥳🍾 The site should now be up on cmput401.ca

## Email setup

In order for the portal to be able to send emails, an email account must be configured in the backend.

1. Add the following to `~/cmput401-portal/backend/.env`

```shell
# the server domain for your email provider, for example:
# Gmail = smtp.gmail.com
# Outlook/Hotmail = smtp-mail.outlook.com
# Yahoo = smtp.mail.yahoo.com
EMAIL_HOST=<SMTP server domain>

# the email address of the host email to send from.
EMAIL_HOST_USER=<email address to send from>

# the password to the account for EMAIL_HOST_USER
EMAIL_HOST_PASSWORD=<password to EMAIL_HOST_USER account>
```

2. In the Django admin panel, add an entry to the mailing list table with your email address
3. Submit a project proposal and verify you received an email on the address you added to the mailing list

### Gmail only

After setting up the .env file, you must allow the app to access your account.

1. Login to the gmail account
2. Go to 'Manage your Google Account'
3. Go to 'Security'
4. Option 1 - 2FA is not enabled
   1. Scroll down to 'Less secure app access'
   2. Turn on access
5. Option 2 - 2FA is enabled:
   1. Scroll down to 'Signing in to Google'
   2. Click 'App passwords'
   3. For 'Select app' select 'Other' and give your app a name.
   4. Save the app password somewhere as you won't be able to see it again
   5. Use the app password in lieu of the email account's password for `EMAIL_HOST_PASSWORD`

## GitHub OAuth2 Authentication setup

To allow users to log in to their portal accounts with GitHub, you must create an OAuth App on GitHub and configure the frontend and backend to use it.

## Steps

1. [Register a new OAuth application on GitHub](https://github.com/settings/applications/new).
   - The authorization callback URL must be set to the URL of the `/login/callback` page on the frontend, which is currently `http://cmput401.ca/login/callback`.
2. Copy the client ID of the application.
3. Click the **Generate a client secret** button and copy the client secret.
4. In `backend/.env`, set the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` variables to the appropriate values.
5. In `frontend/.env`, set the `REACT_APP_GITHUB_CLIENT_ID` variable to the client ID.

You must redeploy the frontend as it needs to rebuild so that it uses the new `REACT_APP_GITHUB_CLIENT_ID` value.

## Redeploy

Redeploying is easy, simply run the redeploy script after pulling your changes.

```shell
cd ~/cmput401-portal/
sudo ./deployment/redeploy.sh
```
