# Project Requirements

**Contributors:** Ayo, Alisha, Andrews, Will, Kyle, Natasha

**Date:** Friday, September 24, 2021

## Executive Summary

The CMPUT 401 project portal will solve the problem of CMPUT 401 students not easily being able to showcase their CMPUT 401 projects to potential employers or to prove that they worked on their CMPUT 401 projects. It will also solve the problem of connecting Albertan nonprofits and early stage startups that have interesting project ideas with teams of CMPUT 401 students who can help implement those ideas. Additionally, the project portal will solve the problem of CMPUT 401 instructors not easily being able to find enough projects for CMPUT 401 students to work on. The project portal's users will be Albertan nonprofits and early stage startups; students; and employers or any other people that are interested in viewing the projects on the portal. The value proposition / essential functionality of the project portal is to connect Albertan nonprofits and early stage startups with teams of students who can help make the nonprofits' and startups' interesting ideas a reality.

## Project Glossary

- **Project**: A project is an app or web app that is being built or was built for a client by students.
- **Project Proposal**: A project proposal is a description of a potential project for students to work on.
- **Client Organization**: A client organization provides a project or many projects for students to work on. Client organizations are primarily Albertan nonprofits or startups, but they could be any organization (e.g. academic institutions like the University of Alberta).
- **Client Representative**: A client representative is a representative of a client organization. Client representatives are primarily the people from the client organization that students will meet with as the students work on the project.
- **Admin**: An admin is a type of user with the ability to accept project proposals, update project information, update user information, and more.
- **Student**: A student is a CMPUT 401 student.
- **Instructor**: An instructor is a CMPUT 401 instructor. Instructors are admins.
- **TA**: A TA is a teaching assistant of CMPUT 401.
- **User**: A user is someone who can login to the project portal. Students, instructors, TAs, client representatives, and admins are users.
- **Visitor**: A visitor is someone who cannot login to the project portal. Employers and other people who view the portal without logging in are visitors.

## **User Stories**

### **US 1.11.1 - Login with GitHub**

As a student, I want to login to my account using GitHub so that I can access my account.

**Acceptance Tests**

- Given that a student has an account created for them by an admin, when they click the Login with GitHub button and are authorized by GitHub, then they should logged in to the portal.

### **US 1.21.1 - Edit Title, Overview & Executive Summary**

As a student, I want to edit my project's title, overview, and executive summary so that my project page's information can be accurate.

**Acceptance Tests**

- Given that a project has been created and that a logged in student has edited their project's title, overview, and executive summary, when they click the “Save Edits” button, their changes should be saved to the database.
- Given that a logged in student has finished editing the project’s information and that the student’s edits have been saved, when the student refreshes their project page, the student’s edits should be applied.

### **US 1.21.2 - Edit External Links (GitHub Repo, Project Link)**

As a student, I want to edit my external links (GitHub repo link, project link) so that portal users can easily access the project repo and the hosted project.

**Acceptance Tests**

- Given that a project has been created and that a logged in student has edited their project's external links, when they click the “Save Edits” button, their changes should be saved to the database.
- Given that a logged in student has finished editing the project’s information and that the student’s edits have been saved, when the student refreshes their project page, the student’s edits should be applied.

### **US 1.21.3 - Edit Embed Links (Screencast, Presentation, Storyboard)**

As a student, I want to edit my project's embed links (screencast link, presentation link, storyboard link) so that my project page's information can be accurate.

**Acceptance Tests**

- Given that a project has been created and that a logged in student has edited their project's embed links, when they click the “Save Edits” button, their changes should be saved to the database.
- Given that a logged in student has finished editing the project’s information and that the student’s edits have been saved, when the student refreshes their project page, the student’s edits should be applied.

### **US 1.21.4 - Edit Tags as Student**

As a student, I want to edit my project's tags so that portal users can discover my project with the tag filtering system.

**Acceptance Tests**

- Given that a project has been created and that a student has edited their project's tags, when they click the “Save Edits” button, their changes should be saved to the database.
- Given that a student has finished editing the project’s information and that the student’s edits have been saved, when the student refreshes their project page, the student’s edits should be applied.

### **US 1.21.5 - Upload Screenshots as Student**

As a student, I want to upload project screenshots so that portal users can see what my project looks like without having to watch the project screencast.

**Acceptance Tests**

- Given that a project has been created and that a student has added their screenshots, when they click the “Upload Screenshots” button, their changes should be saved to the database and the screenshots should be saved to the server.
- Given that a student has finished editing the uploading screenshots and that the student’s edits have been saved, when the student refreshes their project page, the student’s uploaded screenshots should be visible.

### **US 1.31.1 - Edit Name, Bio, and Social Links as Student**

As a student, I want to edit the name, bio, and social platform links in my profile so that my profile page's information can be accurate.

**Acceptance Tests**

- Given that a logged in student has edited their profile name, bio and social links, when they click the “Save Edits” button, their changes should be saved to the database.
- Given that a logged in student has finished editing the profile name, bio and social links, and that the student’s edits have been saved, when the student refreshes their profile page or goes to any other page in which the edited information appears, the student’s edits should be applied.

### **US 1.31.2 - Automatically Use GitHub Profile Picture**

As a student, I want to automatically have my GitHub profile picture as my portal profile picture so that my profile can automatically have an interesting profile picture.

**Acceptance Tests**

- Given that a student has a profile picture on their GitHub, when an account is created for the student, then the students profile picture must be the same as their GitHub profile
- Given that a student does not have a profile picture on their GH, when an account is created for them, then the students profile picture will be the same as the default GH profile picture

### **US 1.31.3 - Edit Profile Picture as Student**

As a student, I want to edit the picture in my profile so that I can personally select the profile picture that would fit the portal best.

**Acceptance Tests**

- Given that a logged in student has edited their profile picture, when they click the “Save Edits” button, their changes should be saved to the database.
- Given that a logged in student has finished editing the profile picture and that the student’s edits have been saved, when the student refreshes their profile page or goes to any other page in which their profile picture appears, the student’s edits should be applied.

### **US 2.11.1 - Login with Email and Password as Client**

As a client representative, I want to login to my account using my email and password so that I can access my account.

**Acceptance Tests**

- Given an unauthenticated user, when submitting a correct email and password combination for a representative user account, the user is authenticated as that client representative.
- Given an unauthenticated user, when submitting an incorrect email and password combination, the user remains unauthenticated.

### **US 2.21.1 - Edit Whatever Student Can Edit as Client**

As a client representative, I want to edit whatever the students working on my project can edit so that the project page's information can be accurate.

**Acceptance Tests**

- The acceptance tests of the following user stories must pass for client representatives:
    - US 1.21.1 - Students can edit project title, overview, executive summary
    - US 1.21.2 - Student can edit projects external links
    - US 1.21.3 - Student can edit a project embed link

### **US 2.21.2 - Edit Client Review**

As a client representative, I want to edit my client review so that the project page of my completed project can display my review of the project.

**Acceptance Tests**

- Given a logged in client representative and a completed project for that client, when the client representative chooses to edit their review and submits the change, the change is reflected on the project page.

### **US 2.21.3 - Edit Tags as Client**

As a client representative, I want to edit my project's tags so that portal users can discover my project with the tag filtering system.

**Acceptance Tests**

- The acceptance tests of the following user stories must pass for client representatives:
    - US 1.21.4 - Edit tags as student

### **US 2.21.4 - Upload Screenshots as Client**

As a client representative, I want to upload project screenshots so that portal users can see what my project looks like without having to watch the project screencast.

**Acceptance Tests**

- The acceptance tests of the following user stories must pass for client representatives:
    - US 1.21.5 - Upload screenshots as student

### **US 2.31.1 - Edit User Name, Bio, and Social Links as Client**

As a client representative, I want to edit the name, bio, and social platform links in my profile so that my profile page's information can be accurate.

**Acceptance Tests**

- Given that a logged in client has edited their profile name, bio and social links, when they click the “Save Edits” button, their changes should be saved to the database.
- Given that a logged in client has finished editing the profile name, bio and social links, and that the client’s edits have been saved, when the student refreshes their profile page or goes to any other page in which the edited information appears, the client’s edits should be applied.

### **US 2.31.2 - Edit User Profile Picture as Client**

As a client representative, I want to edit the picture in my profile so that I can personally select the profile picture that would fit the portal best.

**Acceptance Tests**

- Given that a logged in client has edited their profile picture, when they click the “Save Edits” button, their changes should be saved to the database.
- Given that a logged in client has finished editing the profile picture and that the client’s edits have been saved, when the client refreshes their profile page or goes to any other page in which their profile picture appears, the client’s edits should be applied.

### **US 2.41.1 - Edit Organization Name, Description, Website, and Social Links as Client**

As a client representative, I want to edit the name, description, website and social platform links in my organization's page so that the portal's information about my organization can be accurate.

**Acceptance Tests**

- Given a logged in client representative, when changes are made to the name, description, website link, or social platform links of their organization's profile page, the changes are reflected on the organization profile page and anywhere else that information appears.

### **US 2.41.2 - Edit Client Organization Logo**

As a client representative, I want to edit the logo in my organization's profile so that I can accurately represent my organization on the portal.

**Acceptance Tests**

- Given a logged in client representative, when changes are made to their organization logo, the change is reflected on the organization profile page and anywhere else the organization's logo appears.

### **US 3.11.1 - View Home Page**

As a visitor, I want to view the portal's home page so that I can see some of the portal's projects.

**Acceptance Tests**

- Given a site visitor, when the visitor visits the home route, then the visitor should see the home page

### **US 3.12.1 - View About Page**

As a visitor, I want to view the portal's about page so that I can learn more about the portal.

**Acceptance Tests**

- Given a site visitor, when the visitor visits the about route, then the visitor should see the about page

### **US 3.21.1 - View All Clients**

As a visitor, I want to view all the portal's clients so that I can see which organizations have previously worked with the portal.

**Acceptance Tests**

- Given that client organizations have been created, when a user navigates to the View All Clients page, then a list of all clients (who have at least one published project) is displayed.

### **US 3.21.2 - View Filtered Clients (nonprofit, startup)**

As a visitor, I want to view a filtered list of the portal's clients so that I can see the organizations that have previously worked with the portal that match some filters.

**Acceptance Tests**

- Given a site visitor that is on the all clients page, when the visitor clicks the button to filter by nonprofits, then the visitor should see the only the clients that are nonprofits (and the same occurs for other filters).
- Given a site visitor that is on the all clients page, when the visitor clicks the button to remove a filter and all filters have been removed, then the visitor should see all clients.

### **US 3.21.3 - View Clients with Infinite Scroll**

As a visitor, I want to view the portal's clients with infinite scroll so that I don't have to click any buttons when viewing the clients.

**Acceptance Tests**

- Given a site visitor, when the visitor vists the all clients page, X number of clients should appear on the page.
- Given a site visitor that is on the all clients page with some clients loaded, when the visitor scrolls to the bottom of the page, then X more clients should appear on the page.
- Given a site visitor that is on the all clients page, when the visitor scrolls to the bottom of page and there are no more clients to load, then no more clients should appear.

### **US 3.21.4 - Fuzzy Search Clients**

As a visitor, I want to view fuzzy search clients so that I can look up clients without having to scroll through the client list.

**Acceptance Tests**

- Given a site visitor that is on the all clients page, when the visitor types something into the search field, then the clients that match that thing should appear on the page.
- Given a site visitor that is on the all clients page, when the visitor empties out the search field, then all clients should appear on the page.

### **US 3.31.1 - View All Projects as Visitor**

As a visitor, I want to view all the portal's projects so that I can see what projects CMPUT 401 has previously produced.

**Acceptance Tests**

- Given that projects have been created, when a user navigates to the View All Projects page, then a list of all projects (that have been published) is displayed.

### **US 3.31.2 - View Projects Filtered by Tags as Visitor**

As a visitor, I want to view a filtered list of the portal's projects so that I can see the projects that CMPUT 401 has previously produced that match some tags.

**Acceptance Tests**

- Given a site visitor that is on the all projects page, when the visitor clicks the button to filter by some tag, then the visitor should see the only the projects that have that tag (and the same occurs for other filters).
- Given a site visitor that is on the all projects page, when the visitor clicks the button to remove a filter and all filters have been removed, then the visitor should see all projects.

### **US 3.31.3 - View Projects Filtered by Project Properties as Visitor**

As a visitor, I want to view a filtered list of the portal's projects so that I can see the projects that CMPUT 401 has previously produced that match some properties.

**Acceptance Tests**

- Given a site visitor that is on the View Projects page, when the visitor clicks a button to filter by some property, then the visitor should see the only the projects that have that property (and the same occurs for other filters).
- Given a site visitor that is on the View Projects page, when the visitor clicks the button to remove a filter and all filters have been removed, then the visitor should see all projects.

### **US 3.31.4 - Fuzzy Search Projects**

As a visitor, I want to view fuzzy search projects so that I can look up projects without having to scroll through the project list.

**Acceptance Tests**

- Given a site visitor that is on the all projects page, when the visitor types something into the search field, then the projects that match that thing should appear on the page.
- Given a site visitor that is on the all projects page, when the visitor empties out the search field, then all projects should appear on the page.

### **US 3.32.1 - View Project Page**

As a visitor, I want to view a project's page on the portal so that I can see what the project is about.

**Acceptance Tests**

- Given that a project has been created, when a user navigates to the View Project page for the project, then the project’s details are displayed.

### **US 3.32.2 - View Embedded Screencast**

As a visitor, I want to view an embedded screencast on a portal project page so that I can watch the screencast directly on the portal.

**Acceptance Tests**

- Given a site visitor, when the visitor visits a project page, then the visitor should be able to see the project screencast on the project page, if the project has a screencast.

### **US 3.32.3 - View Embedded Storyboard**

As a visitor, I want to view an embedded storyboard on a portal project page so that I can see the storyboard directly on the portal.

**Acceptance Tests**

- Given a site visitor, when the visitor visits a project page, then the visitor should be able to see the project storyboard on the project page, if the project has a storyboard.

### **US 3.32.4 - View Embedded Presentation**

As a visitor, I want to view an embedded presentation on a portal project page so that I can see the presentation directly on the portal.

**Acceptance Tests**

- Given a site visitor, when the visitor visits a project page, then the visitor should be able to see the project presentation on the project page, if the project has a presentation.

### **US 3.32.5 - Share Project to Facebook & LinkedIn**

As a visitor, I want to share a project that I like to Facebook and LinkedIn so that I can let others know about the project.

**Acceptance Tests**

- Given a site visitor that is on a project page, when the visitor clicks on the “Share to LinkedIn” button (same for other share buttons), then the visitor should be sent to LinkedIn where they’ll be able to share the project.

### **US 3.32.6 - Storyboard thumbnail image can be expanded on click**

As a visitor, I want a project's storyboard thumbnail image to expand on click so that I can selectively choose to either focus or not focus on the project storyboard by clicking on it.

**Acceptance Tests**

- Given a site visitor that is on a project page, when the visitor clicks on a storyboard’s thumbnail image, then the storyboard image should open up larger as a modal.

### **US 3.41.1 - View Client Profile Page**

As a visitor, I want to view a client's profile page on the portal so that I can learn more about the client.

**Acceptance Tests**

- Given that a client organization has been created, when a user navigates to the View Client page for the client organization, then the client organization’s details are displayed.

### **US 3.42.1 - View Student Profile Page**

As a visitor, I want to view a student's profile page on the portal so that I can learn more about the student.

**Acceptance Tests**

- Given that a student account has been created, when a user navigates to the View Profile page for the student, then the student’s details are displayed.

### **US 3.51.1 - Submit the Proposal Form**

As a visitor, I want to submit a project proposal form so that I can collaborate with CMPUT 401 to build some projects and to get those projects placed on the portal.

**Acceptance Tests**

- Given a client has a project proposal, when the client submits the proposal, then an email relating to the proposal gets sent to the admins.

### **US 4.11.1 - Login with Email and Password as Admin**

As an admin, I want to login to my account using my email and password so that I can access my account.

**Acceptance Tests**

- Given that an admin already has a Django Admin account, when the admin enters their email and password at the login screen in Django Admin and clicks the login button, then the admin is successfully logged into their account.

### **US 4.21.1 - Get Email Notifications with New Proposals**

As an admin, I want to get email notifications with new project proposals so that I can respond to the proposals.

**Acceptance Tests**

- Given a client had a project proposal, when the client submits the proposal then the admins get an email notification.

### **US 4.21.2 - Only Get Notifications if Subscribed Admin**

As an admin, I want to only get notifications if I'm a subscribed admin so that I don't get unnecessary notifications if I'm not responsible for handling proposals.

**Acceptance Tests**

- Given a client had a project proposal, when the client submits the proposal then the subscribed admins get an email notification while the others do not.

### **US 4.31.1 - View All Users**

As an admin, I want to view all users so that I can keep track of who's using the project portal.

**Acceptance Tests**

- Given that user accounts have already been created, when a logged in admin navigates to the “Users” page in Django Admin, then a list of all the users is displayed.

### **US 4.31.2 - View Filtered Users**

As an admin, I want to view a filtered list of users so that I can see only the users that I want to see in a particular moment.

**Acceptance Tests**

- Given a list of users on the project portal, when the admin sets some filters then the list of users gets filtered.

### **US 4.32.1 - Individually Create Users and Projects**

As an admin, I want to individually create users and projects so that I can easily add new users and projects to the system.

**Acceptance Tests**

- Given information about a user, when a logged in admin submits the appropriately filled in Django Admin forms to create the new user account, then the new user account is created and can be viewed in the “Users” page in Django Admin.
- Given information about a project, when a logged in admin submits the appropriately filled in Django Admin forms to create the new project, then the new project is created and can be viewed in the “Projects” page in Django Admin.

### **US 4.32.2 - Bulk Create Users and Projects**

As an admin, I want to bulk create users and projects so that I can easily add a large amount of new users and projects to the system.

**Acceptance Tests**

- Given a CSV file of users and projects, when the admin uploads this file then profiles and accounts are created for all projects and users.

### **US 4.33.1 - Edit Student, TA, Client, and Admin Information**

As an admin, I want to edit student, TA, client, and admin information so that I can maintain the accuracy of the portal's information about its users.

**Acceptance Tests**

- Given that student and TA accounts have been created, when a logged in admin edits the student or TA account information, then those edits are reflected in the student or TA profile.
- Given that a client organization has been created, when a logged in admin edits the client organization’s account information, then those edits are reflected in the client organization’s page.
- Given that an admin already has a Django Admin account and has permission to edit other admin accounts, when a logged in admin edits an admin’s account information, then those edits are saved.

### **US 4.34.1 - Delete User and Stuff that is Dependent on the User**

As an admin, I want to delete a user and the stuff that is dependent on the user so that I can maintain the accuracy of the portal's information about its users.

**Acceptance Tests**

- Given a user account in Django Admin, when a logged in admin deletes the user account, then the user account and any information dependent on the user account is deleted from Django Admin.

### **US 4.41.1 - Have Pre-defined User Role Permissions**

As an admin, I want to have pre-defined user role permissions so that I can easily set user permissions by assigning those users to roles.

**Acceptance Tests**

- Given a set of role permissions, when the admin assigns a user a role then that user is able perform actions permitted by their role permissions.

### **US 4.42.1 - Set User’s Admin Status**

As an admin, I want to edit individual user permissions so that I can easily update user permissions for particular users.

**Acceptance Tests**

- Given a logged in admin that has the permission to update other accounts’ permissions, when they grant another user account staff and superuser permissions, then that other user has staff and superuser permissions.
- Given a logged in admin that has the permission to update other accounts’ permissions, when they revoke another user account’s staff and superuser permissions, then that other user no longer has staff and superuser permissions.

### **US 4.51.1 - View All Projects as Admin**

As an admin, I want to view all the portal's projects so that I can see what projects CMPUT 401 has previously produced.

**Acceptance Tests**

- Given that projects have already been created, when a logged in admin navigates to the “Projects” page in Django Admin, then a list of all the projects is displayed.

### **US 4.51.2 - View Projects Filtered by Tags as Admin**

As an admin, I want to view a filtered list of the portal's projects so that I can see the projects that CMPUT 401 has previously produced that match some tags.

**Acceptance Tests**

- Given a list of all projects on the portal, when the admin sets tags then the list of projects gets filtered to projects with those tags.

### **US 4.51.3 - View Projects Filtered by Project Properties as Admin**

As an admin, I want to view a filtered list of the portal's projects so that I can see the projects that CMPUT 401 has previously produced that match some properties.

**Acceptance Tests**

- Given a list of all projects on the portal, when the admin sets what properties they want then the list of projects gets filtered to projects with those properties.

### **US 4.52.1 - Edit Whatever Client Can Edit as Admin**

As an admin, I want to edit whatever clients can edit so that I can maintain the accuracy of the portal's projects.

**Acceptance Tests**

- Given that a client account has been created and that a client has reviewed a project, when a logged in admin edits the client’s review, then the admin’s edited client review is shown on the project’s View Project page.

### **US 4.52.2 - Edit Tags as Admin**

As an admin, I want to edit projects tags so that I can maintain the accuracy of the portal's projects.

**Acceptance Tests**

- Given a project, when the admin edits the project's tags then the admin's edits are reflected on the project’s information.

### **US 4.52.3 - Upload Screenshots as Admin**

As an admin, I want to upload project screenshots so that I can maintain the accuracy of the portal's projects.

**Acceptance Tests**

- Given a project page, when the admin uploads a screenshot then the screenshot is displayed and accessible from the project page.

### **US 4.53.1 - Individually Publish Projects**

As an admin, I want to individually publish projects so that I can easily make individual projects visible to the public.

**Acceptance Tests**

- Given that a project has been created, when a logged in admin sets the project’s is_published boolean value to true (to publish the project), then the project is visible to the public and is searchable by all.
- Given that a project has been created and published, when a logged in admin sets the project’s is_published boolean value to false (to un-publish the project), then the project is no longer visible to the public and is no longer searchable by all.

### **US 4.53.2 - Bulk Publish Projects**

As an admin, I want to bulk publish projects so that I can easily make a large amount of projects visible to the public.

**Acceptance Tests**

- Given a list of projects, when the admin sets all projects to published then all the projects become visible to the public and searchable by all.

### **US 4.54.1 - Delete Project and Stuff that is Dependent on the Project**

As an admin, I want to delete a project and the stuff that is dependent on the project so that I can maintain the accuracy of the portal's project information.

**Acceptance Tests**

- Given a project in Django Admin, when a logged in admin deletes the project, then the project and any information dependent on the project is deleted from Django Admin.

## MoSCoW

### Must Have

- US 1.11.1 - Login with GitHub
- US 1.31.1 - Edit Name, Bio, and Social Links as Student
- US 3.11.1 - View Home Page
- US 3.21.1 - View All Clients
- US 3.31.1 - View All Projects as User
- US 3.32.1 - View Project Page
- US 3.41.1 - View Client Profile Page
- US 3.42.1 - View Student Profile Page
- US 3.51.1 - Submit the Proposal Form
- US 4.11.1 - Login with Email and Password as Admin
- US 4.31.1 - View All Users
- US 4.32.1 - Individually Create Users and Projects
- US 4.32.2 - Bulk Create Users and Projects
- US 4.33.1 - Edit Student, TA, Client, and Admin Information
- US 4.34.1 - Delete User and Stuff that is Dependent on the User
- US 4.51.1 - View All Projects as Admin
- US 4.53.1 - Individually Publish Projects
- US 4.54.1 - Delete Project and Stuff that is Dependent on the Project

### Should Have

- US 1.21.1 - Edit Title, Overview & Executive Summary
- US 1.21.2 - Edit External Links (GitHub Repo, Project Link)
- US 1.21.3 - Edit Embed Links (Screencast, Presentation, Storyboard)
- US 1.21.4 - Edit Tags as Student
- US 2.11.1 - Login with Email and Password as Client
- US 2.21.1 - Edit Whatever Student Can Edit as Client
- US 2.21.2 - Edit Client Review
- US 2.21.3 - Edit Tags as Client
- US 3.12.1 - View About Page
- US 3.21.2 - View Filtered Clients (nonprofit, startup)
- US 3.21.3 - View Clients with Infinite Scroll
- US 3.31.2 - View Projects Filtered by Tags as User
- US 3.31.3 - View Projects Filtered by Project Properties as User
- US 3.32.2 - View Embedded Screencast
- US 4.21.1 - Get Email Notifications with New Proposals
- US 4.21.2 - Only Get Notifications if Subscribed Admin
- US 4.31.2 - View Filtered Users
- US 4.42.1 - Edit Individual User Permissions
- US 4.51.2 - View Projects Filtered by Tags as Admin
- US 4.51.3 - View Projects Filtered by Project Properties as Admin
- US 4.52.1 - Edit Whatever Client Can Edit as Admin
- US 4.52.2 - Edit Tags as Admin
- US 4.53.2 - Bulk Publish Projects

### Could Have

- US 1.21.5 - Upload Screenshots as Student
- US 1.31.2 - Automatically Use GitHub Profile Picture
- US 2.21.4 - Upload Screenshots as Client
- US 2.31.1 - Edit Name, Bio, and Social Links as Client
- US 2.41.1 - Edit Name, Description, Website, and Social Links as Client
- US 2.41.2 - Edit Logo Link
- US 3.32.3 - View Embedded Storyboard
- US 3.32.4 - View Embedded Presentation
- US 4.41.1 - Have Pre-defined User Role Permissions
- US 4.52.3 - Upload Screenshots as Admin

### Would Like to Have

- US 1.31.3 - Edit Profile Picture as Student
- US 2.31.2 - Edit Profile Picture as Client
- US 3.21.4 - Fuzzy Search Clients
- US 3.31.4 - Fuzzy Search Projects
- US 3.32.5 - Share Project to Facebook & LinkedIn
- US 3.32.6 - Storyboard thumbnail image can be expanded on click

## Similar Products

- [ProductHunt](https://www.producthunt.com/posts/notion-2-0)
    - Platform to share and discover new products
    - Design: Demo Page
        - We could use ProductHunt's demo page as inspiration for designing Project Portal's demo pages (so, demo videos would be near the top of the page and user comments would be under the demo videos)
    - Functionality: Upvote Button
        - ProductHunt only has an upvote button for projects (so, no dislike button), and we could implement a similar feature in Project Portals to maintain a positive environment for project contributors.
- [BetaList](https://betalist.com/)
    - Community for makers and early adopters to showcase their startups
    - Design: Home Page
        - We could use BetaList's home page as inspiration for designing Project Portal's home page (so, we'd have a gallery view to showcase projects and their descriptions instead of, or in addition to, a list view)
- [Launching Next](https://www.launchingnext.com/)
    - Platform to publish the newest, trending tech startups and projects.
    - Design: Browse Page
        - Launching Next's startups are organized by tags to browse through, which we could as inspiration for how we organize projects
    - Functionality: External Link to Startup
        - Launching Next's startups have external links to their webpage, so users can go to a startup's webpage directly from the startup's Launching Next webpage. We could implement a similar feature so that project portal pages link to the project webpages/apps.
    - Functionality: Share Link
        - Startups that have a page on Launching Next have the ability to share a link to their Launching Next page. We could implement a similar feature so that clients and students could share links to their projects on the portal.
- [AngelList](https://angel.co/)
    - Platform for investors to find startups to invest in and for people who want to work at startups to find a job.
    - Design: Candidate Profiles
        - AngelList candidates can create profiles with their job title and experiences; we could use that profile design as inspiration for what information students could fill into their project portal student profile.
    - Design: Company Profiles
        - AngelList companies and startups can make profiles with a summary, previous/current jobs, who works there, pictures and descriptions of work culture, etc.; we could use that profile design as inspiration for what information clients could fill into their project portal client profile.
    - Functionality: Job Posting
        - AngelList clients have the ability to post a job and to look for people to join their startup. We could implement a similar feature where project portal clients would be able to propose projects for students to work on directly on the project portal.

## Open-source Products

- [Project Portal for InnerSource](https://github.com/SAP/project-portal-for-innersource)
    - Platform for people to find InnerSource projects.
    - Design: Home Page
        - We could use BetaList's home page as inspiration for designing Project Portal's home page (so, we'd have a gallery view to showcase projects, their project screenshots/images, and their descriptions)
- [React Hook Form](https://react-hook-form.com/)
    - Tool for easing the form-building process in React.
    - Functionality: Tool
        - We could use React Hook Form with all the forms that we create within the project portal to make it easier for us to manage form inputs, form submission and more.

## Technical Resources

### Backend: Django + PostgreSQL

- [Django Documentation](https://docs.djangoproject.com/en/3.2/)
- [Django REST Framework (for the API)](https://www.django-rest-framework.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [Setting up PostgreSQL with Django Tutorial](https://stackpython.medium.com/how-to-start-django-project-with-a-database-postgresql-aaa1d74659d8)
- [Testing in Django](https://docs.djangoproject.com/en/3.2/topics/testing/)

### Frontend: React

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-overview.html)
- [Functional Component React Tutorial](https://youtu.be/w7ejDZ8SWv8)
- [React Testing Overview](https://reactjs.org/docs/testing.html)

### Continuous Integration: GitHub Actions

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Automated Testing with GitHub Actions Tutorial](https://youtu.be/DhUpxWjOhME)
- [GitHub Actions Code Formatting Workflow](https://github.com/psf/black/actions/runs/17913292/workflow)

### Deployment: Cybera

- [Cybera Guide](https://wiki.cybera.ca/display/RAC/Rapid+Access+Cloud+Guide%3A+Part+1)
- [Cybera Tutorial](https://www.youtube.com/watch?v=jv4D8I_AwTQ)
