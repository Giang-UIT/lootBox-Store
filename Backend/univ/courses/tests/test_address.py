from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

# importing the service functions and model from our app
from courses import address as address_service
from courses.models import Address, Account


class AddressServiceTests(TestCase):
    """Tests for the CRUD helper functions defined in `courses/address.py`."""

    def setUp(self):
        # Create a test account for address tests
        self.test_account = Account.objects.create(
            name="Test User Address",
            email="test@example.com",
            password="testpass123"
        )

    def test_create_address(self):
        address = address_service.create_address(
            account=self.test_account,
            phone_number="+1234567890",
            line1="123 Main St",
            line2="Apt 4B",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="Test Country"
        )

        # Verify address was created
        self.assertIsNotNone(address.id)
        self.assertEqual(address.account, self.test_account)
        self.assertEqual(address.phone_number, "+1234567890")
        self.assertEqual(address.line1, "123 Main St")
        self.assertEqual(address.line2, "Apt 4B")
        self.assertEqual(address.city, "Test City")
        self.assertEqual(address.state, "Test State")
        self.assertEqual(address.postal_code, "12345")
        self.assertEqual(address.country, "Test Country")

    def test_get_addresses_for_account(self):
        # Create multiple addresses for the account
        address1 = address_service.create_address(
            account=self.test_account,
            phone_number="+1234567890",
            line1="123 Main St",
            line2="",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="Test Country"
        )
        address2 = address_service.create_address(
            account=self.test_account,
            phone_number="+0987654321",
            line1="456 Oak Ave",
            line2="Suite 100",
            city="Another City",
            state="Another State",
            postal_code="67890",
            country="Another Country"
        )

        # Test getting addresses for the account
        addresses = address_service.get_addresses_for_account(self.test_account)
        self.assertEqual(len(addresses), 2)
        address_ids = [addr.id for addr in addresses]
        self.assertIn(address1.id, address_ids)
        self.assertIn(address2.id, address_ids)

        # Test with account that has no addresses
        other_account = Account.objects.create(
            name="Other User",
            email="other@example.com",
            password="otherpass123"
        )
        empty_addresses = address_service.get_addresses_for_account(other_account)
        self.assertEqual(len(empty_addresses), 0)

    def test_update_address(self):
        # Create an address
        address = address_service.create_address(
            account=self.test_account,
            phone_number="+1234567890",
            line1="123 Main St",
            line2="",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="Test Country"
        )

        # Update the address
        updated_address = address_service.update_address(
            address.id,
            phone_number="+1111111111",
            line1="789 Updated St",
            city="Updated City"
        )

        # Verify updates
        self.assertIsNotNone(updated_address)
        self.assertEqual(updated_address.phone_number, "+1111111111")
        self.assertEqual(updated_address.line1, "789 Updated St")
        self.assertEqual(updated_address.city, "Updated City")
        # Unchanged fields should remain the same
        self.assertEqual(updated_address.line2, "")
        self.assertEqual(updated_address.state, "Test State")

        # Test updating non-existent address
        result = address_service.update_address(99999, line1="Non-existent")
        self.assertIsNone(result)

    def test_delete_address(self):
        # Create an address
        address = address_service.create_address(
            account=self.test_account,
            phone_number="+1234567890",
            line1="123 Main St",
            line2="",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="Test Country"
        )

        # Delete the address
        result = address_service.delete_address(address.id)
        self.assertTrue(result)

        # Verify address was deleted
        with self.assertRaises(Address.DoesNotExist):
            Address.objects.get(id=address.id)

        # Test deleting non-existent address
        result = address_service.delete_address(99999)
        self.assertFalse(result)


class AddressAPITests(APITestCase):
    """Tests for the address API views."""

    def setUp(self):
        # Create a test account
        self.test_account = Account.objects.create(
            name="API Test User",
            email="api@example.com",
            password="apitest123"
        )

    def test_address_list_get(self):
        # Create some addresses
        address1 = address_service.create_address(
            account=self.test_account,
            phone_number="+1234567890",
            line1="123 Main St",
            line2="",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="Test Country"
        )
        address2 = address_service.create_address(
            account=self.test_account,
            phone_number="+0987654321",
            line1="456 Oak Ave",
            line2="Suite 100",
            city="Another City",
            state="Another State",
            postal_code="67890",
            country="Another Country"
        )

        # Test GET request
        url = reverse('address_list', kwargs={'account_id': self.test_account.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Check that addresses are returned with correct data
        address_data = response.data
        self.assertEqual(len(address_data), 2)

        # Find addresses in response
        addr1_data = next((addr for addr in address_data if addr['id'] == address1.id), None)
        addr2_data = next((addr for addr in address_data if addr['id'] == address2.id), None)

        self.assertIsNotNone(addr1_data)
        self.assertIsNotNone(addr2_data)

        # Verify address1 data
        self.assertEqual(addr1_data['phone_number'], "+1234567890")
        self.assertEqual(addr1_data['line1'], "123 Main St")
        self.assertEqual(addr1_data['city'], "Test City")

        # Verify address2 data
        self.assertEqual(addr2_data['phone_number'], "+0987654321")
        self.assertEqual(addr2_data['line1'], "456 Oak Ave")
        self.assertEqual(addr2_data['line2'], "Suite 100")

    def test_address_list_post(self):
        # Test POST request to create address
        url = reverse('address_list', kwargs={'account_id': self.test_account.id})
        data = {
            "phone_number": "+5551234567",
            "line1": "789 New St",
            "line2": "Floor 5",
            "city": "New City",
            "state": "New State",
            "postal_code": "99999",
            "country": "New Country"
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify address was created
        address = Address.objects.get(id=response.data['id'])
        self.assertEqual(address.account, self.test_account)
        self.assertEqual(address.phone_number, "+5551234567")
        self.assertEqual(address.line1, "789 New St")
        self.assertEqual(address.line2, "Floor 5")

    def test_address_list_invalid_account(self):
        # Test with non-existent account
        url = reverse('address_list', kwargs={'account_id': 99999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_address_detail_get(self):
        # Create an address
        address = address_service.create_address(
            account=self.test_account,
            phone_number="+1234567890",
            line1="123 Main St",
            line2="",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="Test Country"
        )

        # Test GET request
        url = reverse('address_detail', kwargs={
            'account_id': self.test_account.id,
            'address_id': address.id
        })
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], address.id)
        self.assertEqual(response.data['phone_number'], "+1234567890")
        self.assertEqual(response.data['line1'], "123 Main St")

    def test_address_detail_put(self):
        # Create an address
        address = address_service.create_address(
            account=self.test_account,
            phone_number="+1234567890",
            line1="123 Main St",
            line2="",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="Test Country"
        )

        # Test PUT request to update
        url = reverse('address_detail', kwargs={
            'account_id': self.test_account.id,
            'address_id': address.id
        })
        data = {
            "phone_number": "+9998887777",
            "line1": "Updated Address",
            "city": "Updated City"
        }

        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify address was updated
        address.refresh_from_db()
        self.assertEqual(address.phone_number, "+9998887777")
        self.assertEqual(address.line1, "Updated Address")
        self.assertEqual(address.city, "Updated City")

    def test_address_detail_delete(self):
        # Create an address
        address = address_service.create_address(
            account=self.test_account,
            phone_number="+1234567890",
            line1="123 Main St",
            line2="",
            city="Test City",
            state="Test State",
            postal_code="12345",
            country="Test Country"
        )

        # Test DELETE request
        url = reverse('address_detail', kwargs={
            'account_id': self.test_account.id,
            'address_id': address.id
        })
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify address was deleted
        with self.assertRaises(Address.DoesNotExist):
            Address.objects.get(id=address.id)

    def test_address_detail_invalid_account_or_address(self):
        # Test with non-existent account
        url = reverse('address_detail', kwargs={
            'account_id': 99999,
            'address_id': 1
        })
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Test with valid account but non-existent address
        url = reverse('address_detail', kwargs={
            'account_id': self.test_account.id,
            'address_id': 99999
        })
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)