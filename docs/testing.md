# Test Documentation

Our automated test suite consists of backend and frontend tests.

## Backend tests

The backend tests use Django's test framework to test the functionality of the backend API. They consist of model tests, which test functions on models and how they react to events, as well as view tests, which test how the API's endpoints respond to valid and invalid requests from users.

The backend tests are located in the `backend/portal/tests` directory. They can be run by executing `python manage.py test` in the `backend` directory.

## Frontend tests

Our project consists of two types of frontend tests: tests that use React Testing Library to test the appearance and functionality of the React components of the site, and end-to-end tests using Selenium to test flows of user interaction with the running frontend. Both of these types of tests are run using Jest.

We implemented one end-to-end test using Selenium that tests the flow of logging into an account using GitHub. The passing of these tests helps to show that the frontend implementation of GitHub login is working properly.

To run all of the frontend tests, run `npm test` in the `frontend` directory.

To run only the React Testing Library tests, run `npm run test:unit`.

To run only the end-to-end tests, run `npm run test:e2e`.

## Other testing

In addition to the automated tests, there is a test fixture that is designed to be representative of real-world data. This fixture can be loaded in the database of a development environment, allowing a tester to perform manual tests of the site's functionality, such as the acceptance tests of each user story.

The realistic test fixture can be loaded into the database by executing `python manage.py loaddata realistic_dummy_data` in the `backend` directory.
