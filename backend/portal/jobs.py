import threading
import time
import traceback

from portal.models import PasswordResetRequest


def start_jobs():
    t = threading.Thread(target=prune_unusable_requests)
    t.daemon = True
    t.start()


def prune_unusable_requests():
    while True:
        time.sleep(60 * 60)

        try:
            PasswordResetRequest.prune_unusable_requests()
        except Exception:
            traceback.print_exc()
