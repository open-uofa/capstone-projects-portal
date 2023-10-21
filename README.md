# Capstone Projects Portal

## Setup

### Prerequisites

1. Python v3.9
2. Node v14 / npm v6
3. PostgreSQL v13

### Installation

Clone the repo.

```
git clone https://github.com/open-uofa/capstone-projects-portal
```

Configure your `backend/.env` file settings appropriately.

Install all dependencies.

```
npm run-script install-all-dependencies
```

Reset the database.

```
npm run-script reset-database
```

Navigate to the backend folder and create a superuser.

```
cd backend && python manage.py createsuperuser
```

## Usage

### Server Commands

To launch the project, you could choose to:
- start the frontend server individually
- start the backend server individually
- start both servers concurrently

To start the frontend server individually, run the following command:

```
npm run-script start-frontend
```

To start the backend server individually, run the following command:

```
npm run-script start-backend
```

To start both servers concurrently, run the following command:

```
npm run-script start-servers
```

## Authors

Developers:

* Alisha Crasta
* Andrews Essilfie
* Ayo Akindele
* Kyle McLean
* Natasha Osmani
* Will Fenton

Instructors:
* Mohayeminul Islam (TA)
* Ildar Akhmetov

## License

This project is licensed under the MIT license.

It is an open-source project, as part of the University of Alberta's Student Open-Source Initiative.

