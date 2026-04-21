<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

type StoredAccount = {
  id: number
  name?: string
  email?: string
}

type Address = {
  id: number
  account_id: number
  phone_number: string
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

const router = useRouter()
const addresses = ref<Address[]>([])
const account = ref<StoredAccount | null>(null)

onMounted(() => {
  const storedAccount = localStorage.getItem('account')
  if (!storedAccount) {
    alert('No account found. Please log in.')
    router.push('/login')
    return
  }
  account.value = JSON.parse(storedAccount)
  loadAddresses()
})

const loadAddresses = async () => {
  if (!account.value) return
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/accounts/${account.value.id}/addresses/`)
    if (response.ok) {
      addresses.value = await response.json()
    } else {
      console.error('Failed to load addresses')
    }
  } catch (error) {
    console.error('Error loading addresses:', error)
  }
}

const addNewAddress = () => {
  router.push('/address')
}

const editAddress = (addressId: number) => {
  router.push(`/address?edit=${addressId}`)
}

const deleteAddress = async (addressId: number) => {
  if (!confirm('Are you sure you want to delete this address?')) return
  if (!account.value) return
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/accounts/${account.value.id}/addresses/${addressId}/`, {
      method: 'DELETE'
    })
    if (response.ok) {
      addresses.value = addresses.value.filter(a => a.id !== addressId)
    } else {
      alert('Failed to delete address')
    }
  } catch (error) {
    console.error('Error deleting address:', error)
  }
}
</script>

<template>
  <div class="addresses-page">
    <div class="addresses-container">
      <h1>My Addresses</h1>
      <button class="add-button" @click="addNewAddress">Add New Address</button>
      <div v-if="addresses.length === 0" class="no-addresses">
        No addresses found.
      </div>
      <div v-else class="addresses-list">
        <div v-for="address in addresses" :key="address.id" class="address-card">
          <div class="address-details">
            <p>{{ address.line1 }}</p>
            <p v-if="address.line2">{{ address.line2 }}</p>
            <p>{{ address.city }}, {{ address.state }} {{ address.postal_code }}</p>
            <p>{{ address.country }}</p>
            <p>Phone: {{ address.phone_number }}</p>
          </div>
          <div class="address-actions">
            <button @click="editAddress(address.id)">Edit</button>
            <button @click="deleteAddress(address.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.addresses-page {
  padding: 40px 20px;
  background: #f3f3f3;
  min-height: 100vh;
}

.addresses-container {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.add-button {
  background: #000;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-button:hover {
  background: #333;
}

.no-addresses {
  text-align: center;
  color: #666;
}

.addresses-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.address-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.address-details p {
  margin: 5px 0;
  color: #555;
}

.address-actions {
  display: flex;
  gap: 10px;
}

.address-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.address-actions button:first-child {
  background: #007bff;
  color: #fff;
}

.address-actions button:first-child:hover {
  background: #0056b3;
}

.address-actions button:last-child {
  background: #dc3545;
  color: #fff;
}

.address-actions button:last-child:hover {
  background: #c82333;
}
</style>