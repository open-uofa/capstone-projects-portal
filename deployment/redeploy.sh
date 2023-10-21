#!/usr/bin/env bash

set -u
set -e

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

source $SCRIPT_DIR/config.sh

# Install any new Python depenencies
echo "Installing Python dependencies..."
cd $PROJECT_DIR
pipenv install

# Apply any new migrations to database
echo "Applying migrations..."
cd $PROJECT_DIR/backend
pipenv run python manage.py migrate

# Collect static backend files
echo "Collecting static backend files..."
yes yes | pipenv run python manage.py collectstatic

# Install any new frontend dependencies
echo "Installing frontend dependencies..."
cd $PROJECT_DIR/frontend
npm install

# Build the frontend
echo "Building frontend... (this will take a while)"
npm run build

# Update the gunicorn config file
echo "Updating gunicorn config file..."
sudo cp $PROJECT_DIR/deployment/gunicorn.service $GUNICORN_SERVICE

# Update the nginx config file
echo "Updating nginx config file..."
sudo cp $PROJECT_DIR/deployment/portal-site $PORTAL_SITE_CONFIG

# Issue daemon reload (in case gunicorn config changed)
echo "Issuing systemctl daemon-reload..."
sudo systemctl daemon-reload

# Restart gunicorn and nginx
echo "Restarting gunicorn..."
sudo systemctl restart gunicorn
echo "Restarting nginx..."
sudo systemctl restart nginx

echo "Done."
