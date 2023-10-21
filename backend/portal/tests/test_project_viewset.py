import json

from django.urls import reverse
from portal.models import Tag, User
from rest_framework.test import APITestCase


class ProjectViewSetTest(APITestCase):
    fixtures = ["project_model_test.json"]

    """
    Tests the backend authorization for editing project info
    """

    """
    Tests the update POST method for project viewset
    """

    def test_update(self):
        with self.subTest("Anonymous User can not edit a project"):
            response = self.client.put(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                {
                    "name": "Anonymous User is Editing",
                    "year": "2022",
                    "type": "MA",
                    "term": "W",
                    "review": "The project by these students are the best",
                },
            )
            self.assertEqual(response.status_code, 404)

        with self.subTest("Admin can edit any project"):
            user = User.objects.get(id="de3f8966-05e0-4928-85d2-44481e80f664")
            self.client.force_authenticate(user=user)
            response = self.client.put(
                reverse(
                    "project-detail", args=("ef570865-ece8-43a8-a468-7b52e1b41950",)
                ),
                {"name": "Admin is Editing", "year": "2022", "type": "MA", "term": "W"},
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["name"], "Admin is Editing")
            self.assertEqual(response.data["type"], "MA")

        with self.subTest("Students can edit a project they part of"):
            user = User.objects.get(id="7333b2fb-efa0-4062-a193-9e813796257b")
            self.client.force_authenticate(user=user)
            response = self.client.put(
                reverse(
                    "project-detail", args=("818ca049-0e2c-4051-8c20-7793469e1298",)
                ),
                {
                    "name": "Student is Editing",
                    "type": "WA",
                    "term": "SP",
                    "year": "2021",
                },
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["name"], "Student is Editing")

        with self.subTest("Students can not update a project they not part of"):
            user = User.objects.get(id="7333b2fb-efa0-4062-a193-9e813796257b")
            self.client.force_authenticate(user=user)
            response = self.client.put(
                reverse(
                    "project-detail", args=("ef570865-ece8-43a8-a468-7b52e1b41950",)
                ),
                {"name": "Admin is Editing", "year": "2022", "type": "MA", "term": "W"},
            )
            self.assertEqual(response.status_code, 404)

        with self.subTest("Client Reps can edit a project they part of"):
            user = User.objects.get(id="e958905d-aec4-4e68-94b1-b5b5ba352f69")
            self.client.force_authenticate(user=user)
            response = self.client.put(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                {
                    "name": "Client Rep is Editing",
                    "year": "2022",
                    "type": "MA",
                    "term": "W",
                    "review": "The project by these students are the best",
                },
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(
                response.data["review"],
                "The project by these students are the best",
            )

        # The required fields for a put request is year, term and type. Without these you get a bad request
        with self.subTest("Bad request"):
            user = User.objects.get(id="e958905d-aec4-4e68-94b1-b5b5ba352f69")
            self.client.force_authenticate(user)
            response = self.client.put(
                reverse(
                    "project-detail", args=("67f1a493-c4f1-4def-81d2-08bceb1e7347",)
                ),
                {
                    "name": "Client Rep is Editing",
                    "term": "W",
                    "review": "The project by these students are the best",
                },
            )
            self.assertEqual(response.status_code, 400)

    """
    Tests the partial update PATCH method for project viewset
    """

    def test_partial_update(self):

        with self.subTest("Anonymouse users cannot partial update"):
            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                {"name": "New name works", "year": "2020"},
            )
            self.assertEqual(response.status_code, 404)

        with self.subTest("Students can edit project"):
            user = User.objects.get(id="2b65801b-346d-400f-bf3a-9ec4b7635d59")
            self.client.force_authenticate(user=user)
            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                {"name": "Student", "year": "2021"},
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["name"], "Student")

        with self.subTest("Client Reps can edit project"):
            user = User.objects.get(id="ce78059b-45fe-40ef-a65b-6d6cb5ca6417")
            self.client.force_authenticate(user=user)
            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                {"name": "Client Rep Jack", "year": "2021"},
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["name"], "Client Rep Jack")

        with self.subTest("Admin can edit a project"):
            user = User.objects.get(id="de3f8966-05e0-4928-85d2-44481e80f664")
            self.client.force_authenticate(user=user)
            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                {
                    "summary": "A project about cooking",
                    "review": "This project has been done well",
                    "website_url": "https://www.google.ca/",
                },
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["website_url"], "https://www.google.ca/")

        # The correct URL form is needed in order to make a good request
        with self.subTest("Bad request"):
            user = User.objects.get(id="de3f8966-05e0-4928-85d2-44481e80f664")
            self.client.force_authenticate(user=user)
            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                {
                    "summary": "A project about cooking",
                    "review": "This project has been done well",
                    "website_url": "www.google.ca",
                },
            )
            self.assertEqual(response.status_code, 400)

    """
    Tag editing tests
    """

    """
    Tests the update POST method for project viewset tag editing
    """

    def test_tag_update(self):
        user = User.objects.get(id="de3f8966-05e0-4928-85d2-44481e80f664")
        self.client.force_authenticate(user=user)

        # Checks if tags can be added and removed
        with self.subTest("Tags can be updated"):
            # add Testing, remove Python
            data = {
                "name": "Another Unpublished Project",
                "type": "OTH",
                "year": 2021,
                "term": "F",
                "tags": [{"value": "Django"}, {"value": "Testing"}],
            }

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["tags"], data["tags"])

        # Checks if tags can be completely deleted
        with self.subTest("Tags can be completely deleted"):
            data = {
                "name": "Another Unpublished Project",
                "type": "OTH",
                "year": 2021,
                "term": "F",
                "tags": [],
            }

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["tags"], data["tags"])

        # Checks if a new tag is inputted, if it is created
        with self.subTest("Tags are created if new"):
            data = {
                "name": "Another Unpublished Project",
                "type": "OTH",
                "year": 2021,
                "term": "F",
                "tags": [
                    {"value": "Django"},
                    {"value": "Testing"},
                    {"value": "New Tag"},
                ],
            }

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)

            # Check if tag has been created
            tag_created = Tag.objects.filter(value="New Tag")
            self.assertEqual(not tag_created, False)

        # Checks if tags are case insenstive so there are no duplicates
        with self.subTest("Tags are created if new"):
            # Python is an existent tag, no new tag should be created
            data = {
                "name": "Another Unpublished Project",
                "type": "OTH",
                "year": 2021,
                "term": "F",
                "tags": [
                    {"value": "Django"},
                    {"value": "Testing"},
                    {"value": "python"},
                ],
            }

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)

            # Check if tag has not been created
            tag_created = Tag.objects.filter(value="python")
            self.assertEqual(not tag_created, True)

            # Does the project use the tag that already exists
            self.assertEqual(
                response.data["tags"],
                [{"value": "Django"}, {"value": "Python"}, {"value": "Testing"}],
            )

        # Checks if duplicate inputted tags are handled
        with self.subTest("Tags are created if new"):
            # Python should appear only once
            data = {
                "name": "Another Unpublished Project",
                "type": "OTH",
                "year": 2021,
                "term": "F",
                "tags": [
                    {"value": "Django"},
                    {"value": "Testing"},
                    {"value": "python"},
                    {"value": "python"},
                ],
            }

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)

            self.assertEqual(
                response.data["tags"],
                [{"value": "Django"}, {"value": "Python"}, {"value": "Testing"}],
            )

    """
    Tests the partial update PATCH method for project viewset tag editing
    """

    def test_tag_partial_update(self):
        user = User.objects.get(id="de3f8966-05e0-4928-85d2-44481e80f664")
        self.client.force_authenticate(user=user)

        # Checks if tags can be added and removed
        with self.subTest("Tags can be updated"):
            # add Testing, remove Python
            data = {"tags": [{"value": "Django"}, {"value": "Testing"}]}

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["tags"], data["tags"])

        # Checks if tags can be completely deleted
        with self.subTest("Tags can be completely deleted"):
            data = {"tags": []}

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["tags"], data["tags"])

        # Checks if a new tag is inputted, if it is created
        with self.subTest("Tags are created if new"):
            data = {
                "tags": [
                    {"value": "Django"},
                    {"value": "Testing"},
                    {"value": "New Tag"},
                ]
            }

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)

            # Check if tag has been created
            tag_created = Tag.objects.filter(value="New Tag")
            self.assertEqual(not tag_created, False)

        # Checks if tags are case insenstive so there are no duplicates
        with self.subTest("Tags are created if new"):
            # Python is an existent tag, no new tag should be created
            data = {
                "tags": [{"value": "Django"}, {"value": "Testing"}, {"value": "python"}]
            }

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)

            # Check if tag has not been created
            tag_created = Tag.objects.filter(value="python")
            self.assertEqual(not tag_created, True)

            # Does the project use the tag that already exists
            self.assertEqual(
                response.data["tags"],
                [{"value": "Django"}, {"value": "Python"}, {"value": "Testing"}],
            )

        # Checks if duplicate inputted tags are handled
        with self.subTest("Tags are created if new"):
            # Python should appear only once
            data = {
                "tags": [
                    {"value": "Django"},
                    {"value": "Testing"},
                    {"value": "python"},
                    {"value": "python"},
                ]
            }

            response = self.client.patch(
                reverse(
                    "project-detail", args=("3606e866-2614-4383-b031-69f70a737603",)
                ),
                json.dumps(data),
                content_type="application/json",
            )

            self.assertEqual(response.status_code, 200)

            self.assertEqual(
                response.data["tags"],
                [{"value": "Django"}, {"value": "Python"}, {"value": "Testing"}],
            )

    """
    Tests the list endpoint
    """

    def test_list(self):
        published_projects = {
            "a540b66c-430d-435d-9ac1-b89a2d28f37f",
            "c467e9ba-3893-4698-948f-b3a2a63f7a7e",  # not displayed on home page
            "ef570865-ece8-43a8-a468-7b52e1b41950",  # not displayed on home page
        }

        home_page_projects = {
            "a540b66c-430d-435d-9ac1-b89a2d28f37f",
            "818ca049-0e2c-4051-8c20-7793469e1298",  # unpublished
        }

        # Anonymous users should see published projects with display_on_home_page=True
        # when the query parameter home_page=true is set
        with self.subTest("Anonymous user with ?home_page=true"):
            response = self.client.get(f'{reverse("project-list")}?home_page=true')

            response_project_ids = {project["id"] for project in response.data}

            self.assertEqual(
                response_project_ids,
                published_projects.intersection(home_page_projects),
            )

        # Anonymous users should see published projects
        # when the query parameter home_page=false is set
        with self.subTest("Anonymous user with ?home_page=true"):
            response = self.client.get(f'{reverse("project-list")}?home_page=false')

            response_project_ids = {project["id"] for project in response.data}

            self.assertEqual(
                response_project_ids,
                published_projects,
            )

        # Anonymous users should see published projects
        # when the query parameter home_page is not included
        with self.subTest("Anonymous user with ?home_page=true"):
            response = self.client.get(reverse("project-list"))

            response_project_ids = {project["id"] for project in response.data}

            self.assertEqual(
                response_project_ids,
                published_projects,
            )

        # Superusers should see all projects with display_on_home_page=True (including unpublished projects)
        # when the query parameter home_page=true is set
        with self.subTest("Anonymous user with ?home_page=true"):
            user = User.objects.get(id="de3f8966-05e0-4928-85d2-44481e80f664")
            self.client.force_authenticate(user=user)

            response = self.client.get(f'{reverse("project-list")}?home_page=true')

            response_project_ids = {project["id"] for project in response.data}

            self.assertEqual(
                response_project_ids,
                home_page_projects,
            )
