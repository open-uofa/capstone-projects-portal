# Software Design

**Contributors:** Will, Natasha, Kyle, Ayo, Alisha, Andrews

**Date:** Friday, September 24, 2021

## Architecture

### Backend

We plan to use [Django](https://www.djangoproject.com/), [PostgreSQL](https://www.postgresql.org/), and the [Django REST framework](https://www.django-rest-framework.org/) for our backend.

### Frontend

We plan to use [React](https://reactjs.org/) for our frontend. We also intend to leverage the [Django admin interface](https://docs.djangoproject.com/en/3.2/ref/contrib/admin/) to facilitate management of users and projects for 401 instructors and TAs.

### Authentication

Authentication will vary based on the type of user. Admins and client representatives will login with an email and password, while students and TAs login with GitHub.

### Architecture Diagram

[![Architecture diagram](images/architecture-diagram.png)](images/architecture-diagram.png)

## UML Class Diagram

We made a UML class diagram for our Django models classes, to model their attributes and the relationships between them.

[![UML class diagram](images/uml-class-diagram.png)](images/uml-class-diagram.png)

## Sequence Diagrams

We made some sequence diagrams to visualize interactions between users and the site. These do not cover all interactions, just some we thought were particularly complex or interesting.

### Filter Projects

Visitors to the project portal are able to filter projects across various dimensions (term, programming languages, frameworks, etc.). This diagram shows the call to our REST API to get projects matching the filter.

[![Sequence diagram for filtering projects](images/filter-projects.png)](images/filter-projects.png)

### Project Proposal

Potential clients visiting the site are able to submit proposals for future CMPUT 401 projects. This diagram shows the process of submitting a project (which is automatically emailed to 401 staff).

[![Sequence diagram for proposing projects](images/propose-project.png)](images/propose-project.png)

### Importing Projects and Students

Admins can bulk create projects and student accounts by uploading a CSV to the site.

[![Sequence diagram for importing students and projects](images/import-data.png)](images/import-data.png)

### Login with Email and Password

Admins and client representatives can login to the site with their email and password.

[![Sequence diagram for logging in with email and password](images/login-with-password.png)](images/login-with-password.png)

### Login with GitHub

Students and TAs can login to the site with GitHub.

[![Sequence diagram for logging in with GitHub](images/login-with-github.png)](images/login-with-github.png)

### Edit Projects

Students can edit the information on their project page.

[![Sequence diagram for editing projects](images/edit-project.png)](images/edit-project.png)

## Low-Fidelity User Interface

This diagram shows a prototype of the website's UI, and the interactions and links between the different pages.

[![Low-fidelity UI](images/low-fidelity-ui.png)](images/low-fidelity-ui.png)
