from django.test import TestCase
from decimal import Decimal
import unittest

from courses import admin as admin_service
from courses import account as account_service
from courses import product as product_service


class AdminServiceTests(TestCase):
    """Tests for the admin wrapper functions defined in `courses/admin.py`."""

    IMAGE_URL = "https://example.com/product.jpg"

    def setUp(self):
        self.admin = account_service.create_account(
            name="Admin", password="adminpw", email="admin@example.com", admin_status=True
        )
        self.user = account_service.create_account(
            name="User", password="userpw", email="user@example.com", admin_status=False
        )

    def test_is_admin(self):
        self.assertTrue(admin_service.is_admin(self.admin.id))
        self.assertFalse(admin_service.is_admin(self.user.id))
        self.assertFalse(admin_service.is_admin(999999))

    def test_admin_create_product_success(self):
        p = admin_service.admin_create_product(
            self.admin.id,
            "brazil box",
            "campeo de mundo",
            Decimal("10.00"),
            5,
            "Brazil",
            self.IMAGE_URL,
        )
        self.assertIsNotNone(p.id)
        self.assertEqual(p.name, "brazil box")
        self.assertEqual(p.description, "campeo de mundo")
        self.assertEqual(p.price, Decimal("10.00"))
        self.assertEqual(p.stock_quantity, 5)
        self.assertEqual(p.origin_country, "Brazil")
        self.assertEqual(p.image, self.IMAGE_URL)

    def test_admin_create_product_permission_denied(self):
        with self.assertRaises(PermissionError):
            admin_service.admin_create_product(
                self.user.id,
                "Coffee",
                "Beans",
                Decimal("10.00"),
                5,
                "Brazil",
                self.IMAGE_URL,
            )

    def test_admin_update_product_success(self):
        p = product_service.create_product(
            name="old box",
            description="lame",
            price=Decimal("1.00"),
            stock=1,
            origin="norway",
            image="https://example.com/old.jpg",
        )

        admin_service.admin_update_product(
            self.admin.id,
            p.id,
            name="sweden box",
            description="cool items",
            price=Decimal("2.50"),
            stock=10,
            origin="sweden",
            image="https://example.com/new.jpg"
        )

        refreshed = product_service.get_product_by_id(p.id)
        self.assertEqual(refreshed.name, "sweden box")
        self.assertEqual(refreshed.description, "cool items")
        self.assertEqual(refreshed.price, Decimal("2.50"))
        self.assertEqual(refreshed.stock_quantity, 10)
        self.assertEqual(refreshed.origin_country, "sweden")
        self.assertEqual(refreshed.image, "https://example.com/new.jpg") 

    def test_admin_update_product_permission_denied(self):
        p = product_service.create_product(
            name="old box",
            description="lame",
            price=Decimal("1.00"),
            stock=1,
            origin="norway",
            image=self.IMAGE_URL,
        )
        with self.assertRaises(PermissionError):
            admin_service.admin_update_product(self.user.id, p.id, name="Nope")

    def test_admin_delete_product_success_and_permission_denied(self):
        p = product_service.create_product(
            name="X",
            description="Y",
            price=Decimal("3.00"),
            stock=2,
            origin="norway",
            image=self.IMAGE_URL,
        )
        with self.assertRaises(PermissionError):
            admin_service.admin_delete_product(self.user.id, p.id)

        admin_service.admin_delete_product(self.admin.id, p.id)
        self.assertIsNone(product_service.get_product_by_id(p.id))

    def test_admin_create_account_success(self):
        new_acc = admin_service.admin_create_account(
            self.admin.id, name="NewUser", email="new@x.com", password="pw", admin_status=False
        )
        self.assertIsNotNone(new_acc.id)
        self.assertEqual(new_acc.email, "new@x.com")
        self.assertFalse(new_acc.admin_status)

    def test_admin_create_account_permission_denied(self):
        with self.assertRaises(PermissionError):
            admin_service.admin_create_account(
                self.user.id, name="No", email="no@x.com", password="pw", admin_status=False
            )

    def test_admin_update_account_success(self):
        target = account_service.create_account("Target", "t", "target@x.com", admin_status=False)

        admin_service.admin_update_account(
            self.admin.id,
            target.id,
            name="Target2",
            email="target2@x.com",
            password="newpw",
            admin_status=True,
        )

        refreshed = account_service.get_account_by_id(target.id)
        self.assertEqual(refreshed.name, "Target2")
        self.assertEqual(refreshed.email, "target2@x.com")
        self.assertEqual(refreshed.password, "newpw")
        self.assertTrue(refreshed.admin_status)

    def test_admin_update_account_permission_denied(self):
        target = account_service.create_account("Target", "t", "target@x.com", admin_status=False)
        with self.assertRaises(PermissionError):
            admin_service.admin_update_account(self.user.id, target.id, name="Nope")

    def test_admin_delete_account_success_and_permission_denied(self):
        target = account_service.create_account("Del", "d", "del@x.com", admin_status=False)

        with self.assertRaises(PermissionError):
            admin_service.admin_delete_account(self.user.id, target.id)

        admin_service.admin_delete_account(self.admin.id, target.id)
        self.assertIsNone(account_service.get_account_by_id(target.id))


if __name__ == "__main__":
    unittest.main()