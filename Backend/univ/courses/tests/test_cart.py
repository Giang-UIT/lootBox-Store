from django.test import TestCase
import unittest
from courses.models import Cart, CartItem, Product, Account
from courses.cart import (
    add_product_to_cart,
    decrease_product_from_cart,
    remove_product_from_cart,
    set_quantity_of_a_product_in_a_cart,
    update_status,
)


class CartBackendTests(TestCase):
    IMAGE_URL = "https://example.com/product.jpg"

    def setUp(self):
        self.user = Account.objects.create(
            name="testuser",
            password="1234",
            email="testuser@uit.no"
        )

        self.product = Product.objects.create(
            name="Laptop",
            description="Test product",
            price=100,
            stock_quantity=10,
            origin_country="Norway",
            image=self.IMAGE_URL,
        )

        self.product2 = Product.objects.create(
            name="Coffee Mug",
            description="A nice mug",
            price=15,
            stock_quantity=50,
            origin_country="Norway",
            image=self.IMAGE_URL,
        )

    def test_add_product_creates_cart(self):
        add_product_to_cart(self.user, self.product, 1)
        cart = Cart.objects.get(account=self.user, status='active')
        self.assertEqual(cart.items.count(), 1)

    def test_add_same_product_increases_quantity(self):
        add_product_to_cart(self.user, self.product, 1)
        add_product_to_cart(self.user, self.product, 3)
        cart = Cart.objects.get(account=self.user, status='active')
        item = cart.items.first()
        self.assertEqual(item.item_quantity, 4)

    def test_decrease_product(self):
        add_product_to_cart(self.user, self.product, 3)
        decrease_product_from_cart(self.user, self.product, 1)
        cart = Cart.objects.get(account=self.user, status='active')
        item = cart.items.first()
        self.assertEqual(item.item_quantity, 2)

    def test_decrease_to_zero_removes_item(self):
        add_product_to_cart(self.user, self.product, 1)
        decrease_product_from_cart(self.user, self.product, 1)
        cart = Cart.objects.get(account=self.user, status='active')
        self.assertEqual(cart.items.count(), 0)

    def test_remove_product(self):
        add_product_to_cart(self.user, self.product, 2)
        remove_product_from_cart(self.user, self.product)
        cart = Cart.objects.get(account=self.user, status='active')
        self.assertEqual(cart.items.count(), 0)

    def test_set_quantity(self):
        add_product_to_cart(self.user, self.product, 1)
        set_quantity_of_a_product_in_a_cart(self.user, self.product, 5)
        cart = Cart.objects.get(account=self.user, status='active')
        item = cart.items.first()
        self.assertEqual(item.item_quantity, 5)

    def test_checkout_updates_status(self):
        add_product_to_cart(self.user, self.product, 1)
        update_status(self.user, 'checked_out')
        cart = Cart.objects.get(account=self.user)
        self.assertEqual(cart.status, 'checked_out')

    def test_cart_can_hold_multiple_different_products(self):
        add_product_to_cart(self.user, self.product, 1)
        add_product_to_cart(self.user, self.product2, 2)

        cart = Cart.objects.get(account=self.user, status='active')
        self.assertEqual(cart.items.count(), 2)

        laptop_item = cart.items.get(product=self.product)
        mug_item = cart.items.get(product=self.product2)
        self.assertEqual(laptop_item.item_quantity, 1)
        self.assertEqual(mug_item.item_quantity, 2)

    def test_set_negative_quantity_removes_item(self):
        add_product_to_cart(self.user, self.product, 3)
        set_quantity_of_a_product_in_a_cart(self.user, self.product, -2)

        cart = Cart.objects.get(account=self.user, status='active')
        self.assertEqual(cart.items.count(), 0)

    def test_decrease_product_not_in_cart_does_not_crash(self):
        decrease_product_from_cart(self.user, self.product, 1)

        active_carts = Cart.objects.filter(account=self.user, status='active')
        if active_carts.exists():
            self.assertEqual(active_carts.first().items.count(), 0)

    def test_adding_item_after_checkout_creates_new_cart(self):
        add_product_to_cart(self.user, self.product, 1)
        update_status(self.user, 'checked_out')

        add_product_to_cart(self.user, self.product2, 1)

        carts = Cart.objects.filter(account=self.user)
        self.assertEqual(carts.count(), 2)

        active_cart = carts.get(status='active')
        self.assertEqual(active_cart.items.count(), 1)
        self.assertEqual(active_cart.items.first().product, self.product2)


if __name__ == "__main__":
    unittest.main()