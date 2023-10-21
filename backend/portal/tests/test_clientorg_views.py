from django.urls import reverse
from portal.models import User
from rest_framework.test import APITestCase


class ClientOrgViewSetTest(APITestCase):
    """
    Testing the custom update and partial update methods for clientorg models, depending on the type of user logged in.
    """

    fixtures = ["client_org_view_set_test.json"]

    def test_update(self):
        # Anonymous Users cannot update at all
        with self.subTest("Anonymous User Client Org Update"):
            update_org = self.client.put(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "New Name", "type": "Community Service Learning"},
            )

            # Permission Denied
            self.assertEqual(update_org.status_code, 403)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertNotEqual(response.data["name"], "New Name")

        # Authorized Users who are not the client rep cannot update at all
        with self.subTest("Authorized User Client Org Update"):
            user = User.objects.get(id="741d7cd9-55ff-451b-90a3-ad27225aa56b")
            self.client.force_authenticate(user=user)

            update_org = self.client.put(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "New Name", "type": "Community Service Learning"},
            )

            # Permission denied
            self.assertEqual(update_org.status_code, 403)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertNotEqual(response.data["name"], "New Name")

        # Client Rep User can update their organization
        with self.subTest("Client Rep User Client Org Update"):

            user = User.objects.get(id="dbfe48b1-5762-4b17-8560-b0d7e73d8bd9")
            self.client.force_authenticate(user=user)

            update_org = self.client.put(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "Rep New Name", "type": "Other"},
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertEqual(response.data["name"], "Rep New Name")

        # Admins can update any org
        with self.subTest("Admin Client Org Update"):
            user = User.objects.get(id="2b1f5466-9d6c-486c-8b49-e29690a35abe")
            self.client.force_authenticate(user=user)

            update_org = self.client.put(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "Admin New Name", "type": "Other"},
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertEqual(response.data["name"], "Admin New Name")

    def test_partial_update(self):
        # Anonymous Users cannot update at all
        with self.subTest("Anonymous User Client Org Partial Update"):
            update_org = self.client.patch(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "New Name"},
            )

            self.assertEqual(update_org.status_code, 403)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertNotEqual(response.data["name"], "New Name")

        # Authorized Users who are not the client rep cannot update at all
        with self.subTest("Authorized User Client Org Partial Update"):
            user = User.objects.get(id="741d7cd9-55ff-451b-90a3-ad27225aa56b")
            self.client.force_authenticate(user=user)

            update_org = self.client.patch(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "New Name"},
            )

            self.assertEqual(update_org.status_code, 403)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertNotEqual(response.data["name"], "New Name")

        # Client Rep User can partially update their orgs
        with self.subTest("Client Rep User Client Org Partial Update"):
            user = User.objects.get(id="dbfe48b1-5762-4b17-8560-b0d7e73d8bd9")
            self.client.force_authenticate(user=user)

            update_org = self.client.patch(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "Rep New Name"},
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertEqual(response.data["name"], "Rep New Name")

        # Admins can do partial updates any org
        with self.subTest("Admin Client Org Partial Update"):
            user = User.objects.get(id="2b1f5466-9d6c-486c-8b49-e29690a35abe")
            self.client.force_authenticate(user=user)

            update_org = self.client.patch(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "Admin New Name"},
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertEqual(response.data["name"], "Admin New Name")

        # Client can't update certain fields
        with self.subTest("Client Rep User Client Org Failed Partial Update"):

            user = User.objects.get(id="dbfe48b1-5762-4b17-8560-b0d7e73d8bd9")
            self.client.force_authenticate(user=user)

            update_org = self.client.patch(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"name": "Rep New Name"},
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertNotEqual(
                response.data["id"], "2b1f5466-9d6c-486c-8b49-e29690a35abe"
            )

        # Admins can't update certain fields
        with self.subTest("Admin Failed Client Org Partial Update"):
            user = User.objects.get(id="2b1f5466-9d6c-486c-8b49-e29690a35abe")
            self.client.force_authenticate(user=user)

            update_org = self.client.patch(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",)),
                {"id": "2b1f5466-9d6c-486c-8b49-e29690a35abe"},
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("org-detail", args=("e80a1f60-bbf6-4460-b9e7-d3800cb19d64",))
            )

            self.assertNotEqual(
                response.data["id"], "2b1f5466-9d6c-486c-8b49-e29690a35abe"
            )
