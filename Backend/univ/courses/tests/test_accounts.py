from django.test import TestCase
import unittest

# importing the service functions and model from our app
from courses import account as account_service


class AccountServiceTests(TestCase):
    """Tests for the CRUD helper functions defined in `courses/account.py`."""

    def test_create_account_and_defaults(self):
        acc = account_service.create_account(
            name="Alice", password="secret", email="alice@example.com"
        )

        # object should be persisted and have expected attributes
        self.assertIsNotNone(acc.id)
        self.assertEqual(acc.name, "Alice")
        self.assertEqual(acc.email, "alice@example.com")
        self.assertEqual(acc.password, "secret")
        self.assertFalse(acc.admin_status)

    def test_get_account_by_id_and_email(self):
        created = account_service.create_account(
            name="Bob", password="pw", email="bob@example.com"
        )

        # by id
        by_id = account_service.get_account_by_id(created.id)
        self.assertEqual(by_id, created)

        # by email
        by_email = account_service.get_account_by_email("bob@example.com")
        self.assertEqual(by_email, created)

        # non existing should return None
        self.assertIsNone(account_service.get_account_by_id(9999))
        self.assertIsNone(account_service.get_account_by_email("noone@nowhere"))

    def test_get_all_accounts(self):
        # ensure the queryset returns everything
        account_service.create_account("A", "1", "a@x.com")
        account_service.create_account("B", "2", "b@x.com")
        qs = account_service.get_all_accounts()
        self.assertEqual(qs.count(), 2)

    def test_update_functions(self):
        acc = account_service.create_account("C", "c", "c@x.com")

        updated_name = account_service.update_account_name(acc.id, "Carol")
        self.assertEqual(updated_name.name, "Carol")

        updated_email = account_service.update_account_email(
            acc.id, "carol@x.com"
        )
        self.assertEqual(updated_email.email, "carol@x.com")

        updated_password = account_service.update_account_password(acc.id, "newp")
        self.assertEqual(updated_password.password, "newp")

        updated_admin = account_service.update_account_admin_status(acc.id, True)
        self.assertTrue(updated_admin.admin_status)

        # operations on non-existent id should return None
        self.assertIsNone(account_service.update_account_name(999, "no"))
        self.assertIsNone(account_service.update_account_email(999, "no@x"))
        self.assertIsNone(account_service.update_account_password(999, "no"))
        self.assertIsNone(account_service.update_account_admin_status(999, False))

    def test_delete_functions(self):
        acc = account_service.create_account("D", "d", "d@x.com")

        # delete by id
        self.assertTrue(account_service.delete_account(acc.id))
        self.assertIsNone(account_service.get_account_by_id(acc.id))

        # delete returns False for missing
        self.assertFalse(account_service.delete_account(999))

        # create again to test delete by email
        acc2 = account_service.create_account("E", "e", "e@x.com")
        self.assertTrue(account_service.delete_account_by_email("e@x.com"))
        self.assertIsNone(account_service.get_account_by_email("e@x.com"))
        self.assertFalse(account_service.delete_account_by_email("missing@x.com"))

def __main__():
    unittest.main()
