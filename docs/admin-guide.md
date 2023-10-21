# Admin User Guide

## Admin Panel

1. Log into Django admin with an admin account
1. Click any of the _'Portal'_ models to view them
   1. Set any filters on the right of the list to filter
1. Bulk Publish/Unpublish
   1. Go to the _'Projects'_ section of Django Admin
   1. Set filters to your liking
   1. Check the box next to all projects you wish to publish
   1. Click the drop down menu next to _'Action'_
   1. Select which action you wish to perform
   1. Click _'Go'_ to perform action

## Import CSV

1. Click your icon in the top right corner
2. Select option labeled ‘Import data’
3. Click _'Choose File'_ and choose a CSV file to import, or drag and drop CSV file into designated area
4. Click _'Validate'_
5. If there are no errors, and the response looks correct to you, click _'Import'_ to create the data
6. Verify the data was successfully created in the Django admin page

Validating the CSV essentially does a dry run of the import, rolling back any changes made at the end.

## CSV Format

Every row in the CSV has the following entities:

1. A project (`Project`)
2. A client organization (`ClientOrg`)
3. A client representative (`User`)
4. A teaching assistant (`User`)
5. A student (`User`)

The columns of the CSV are:

1. `project_name` - unique, required
2. `project_year` - required
3. `project_term` - required, options are `Fall`, `Winter`, `Spring`, `Summer`
4. `client_org_name` - unique, required
5. `client_rep_email` - unique, required
6. `client_rep_name`
7. `client_rep_github_username`
8. `ta_email` - unique, required
9. `ta_name`
10. `ta_github_username`
11. `student_email` - unique, required
12. `student_name`
13. `student_github_username`

When each row in the CSV is processed, the following happens:

1. Check the DB for a project with the name `project_name`
   1. If none exists, create a new project with `project_name`, `project_year`, `project_term`
2. Check the DB for a client org with the name `client_org_name`
   1. If none exists, create a new client org with `client_org_name`
3. Check the DB for a user with the email `client_rep_email`
   1. If none exists, create a user with `client_rep_email`, `client_rep_name`, `client_rep_github_username`
4. Check the DB for a user with the email `ta_email`
   1. If none exists, create a user with `ta_email`, `ta_name`, `ta_github_username`
5. Check the DB for a user with the email `student_email`
   1. If none exists, create a user with `student_email`, `student_name`, `student_github_username`
6. Assign client org to project: `project.client_org = client_org`
7. Assign client rep to client org: `client_org.reps.add(rep)`
8. Assign client rep to project: `project.rep = rep`
9. Assign TA to project: `project.ta = ta`
10. Assign student to project: `project.students.add(student)`

### Sample CSV

This creates 1 project with 1 client org, 1 client rep, and 6 students.

```
project_name,project_year,project_term,client_org_name,client_rep_email,client_rep_name,client_rep_github_username,ta_email,ta_name,ta_github_username,student_email,student_name,student_github_username
CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,wfenton@ualberta.ca,Will Fenton,willfenton
CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,aakindel@ualberta.ca,Ayo Akindele,aakindel
CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,mclean1@ualberta.ca,Kyle McLean,kylemclean
CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,nahmed2@ualberta.ca,Natasha Osmani,osmani2
CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,crasta@ualberta.ca,Alisha Crasta,alisha03
CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,essilfie@ualberta.ca,Andrews Essilfie,essilfie
```
