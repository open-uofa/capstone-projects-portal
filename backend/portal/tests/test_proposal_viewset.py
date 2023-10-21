from django.urls import reverse
from portal.models import Proposal
from rest_framework.test import APITestCase


class ProposalViewSetTest(APITestCase):
    fixtures = ["proposal_model_test.json"]

    def test_create_proposal(self):
        # you can only post a proposal
        with self.subTest("You can only make a post request for a proposal"):
            send_proposal = self.client.post(
                reverse("proposal-list"),
                {
                    "rep_name": "Jacker",
                    "email": "tester@email.com",
                    "project_info": "'this is a test data",
                    "date": "2021-10-10",
                },
            )
            self.assertEqual(send_proposal.status_code, 200)
            self.assertEqual(Proposal.objects.all().count(), 4)

            get_proposal = self.client.get(
                reverse("proposal-list"),
            )
            self.assertEqual(get_proposal.status_code, 405)
            self.assertEqual(Proposal.objects.all().count(), 4)

        with self.subTest(
            "Proposal can only be made if correct fields are filled  out"
        ):
            send_proposal = self.client.post(
                reverse("proposal-list"),
                {
                    "rep_name": "Jacker",
                    "email": "tester@email.com",
                    "date": "2021-10-10",
                },
            )
            self.assertEqual(send_proposal.status_code, 400)
            self.assertEqual(Proposal.objects.all().count(), 4)
