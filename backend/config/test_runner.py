import logging

from django.test.runner import DiscoverRunner


class TestRunner(DiscoverRunner):
    """
    Test runner that disables logging before running tests.
    """

    def run_tests(self, test_labels, **kwargs):
        logging.disable(logging.CRITICAL)
        return super().run_tests(test_labels, **kwargs)
