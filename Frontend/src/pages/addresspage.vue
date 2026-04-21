<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

type StoredAccount = {
  id: number
  name?: string
  email?: string
}

type SavedAddress = {
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
const route = useRoute()

const phoneNumber = ref('')
const streetAddress = ref('')
const apartment = ref('')
const city = ref('')
const state = ref('')
const zipCode = ref('')
const country = ref('United States')

const isEditing = ref(false)
const editingAddressId = ref<number | null>(null)

const savedAccount = ref<StoredAccount | null>(null)
const savedAddress = ref<SavedAddress | null>(null)

const validationMessage = ref('')

const isFormValid = computed(() => {
  return (
    phoneNumber.value.trim().length > 0 &&
    streetAddress.value.trim().length > 0 &&
    city.value.trim().length > 0 &&
    state.value.trim().length > 0 &&
    zipCode.value.trim().length > 0 &&
    country.value.trim().length > 0
  )
})

onMounted(async () => {
  const storedAccount = localStorage.getItem('account')

  if (storedAccount) {
    try {
      savedAccount.value = JSON.parse(storedAccount)
    } catch {
      savedAccount.value = null
    }
  }

  const editId = route.query.edit as string
  if (editId) {
    isEditing.value = true
    editingAddressId.value = parseInt(editId)
    await loadAddressForEdit()
  }

})

const loadAddressForEdit = async () => {
  if (!savedAccount.value || !editingAddressId.value) return
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/accounts/${savedAccount.value.id}/addresses/${editingAddressId.value}/`)
    if (response.ok) {
      const address = await response.json()
      phoneNumber.value = address.phone_number
      streetAddress.value = address.line1
      apartment.value = address.line2
      city.value = address.city
      state.value = address.state
      zipCode.value = address.postal_code
      country.value = address.country
    } else {
      alert('Failed to load address for editing')
      router.push('/addresses')
    }
  } catch (error) {
    console.error('Error loading address:', error)
  }
}



const submitAddress = async () => {
  const payload = {
    phoneNumber: phoneNumber.value,
    streetAddress: streetAddress.value,
    apartment: apartment.value,
    city: city.value,
    state: state.value,
    zipCode: zipCode.value,
    country: country.value
  }

  if (!isFormValid.value) {
    validationMessage.value = 'Please fill in all required fields before saving.'
    return
  }

  validationMessage.value = ''
  const storedAccount = localStorage.getItem('account')
  if (!storedAccount) {
    alert('No logged in account found.')
    return
  }

  const account = JSON.parse(storedAccount) as StoredAccount

  try {
    let response
    if (isEditing.value && editingAddressId.value) {
      // Update
      response = await fetch(`http://127.0.0.1:8000/api/accounts/${account.id}/addresses/${editingAddressId.value}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phoneNumber.value,
          line1: streetAddress.value,
          line2: apartment.value,
          city: city.value,
          state: state.value,
          postal_code: zipCode.value,
          country: country.value
        })
      })
    } else {
      // Create
      response = await fetch(`http://127.0.0.1:8000/api/accounts/${account.id}/addresses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phoneNumber.value,
          line1: streetAddress.value,
          line2: apartment.value,
          city: city.value,
          state: state.value,
          postal_code: zipCode.value,
          country: country.value
        })
      })
    }

    const text = await response.text()
    let data: any

    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }

    if (!response.ok) {
      console.error('Backend error:', data)
      alert(data.error || 'Failed to save address')
      return
    }

    validationMessage.value = ''
    alert(isEditing.value ? 'Address updated successfully' : 'Address saved successfully')
    router.push('/addresses')
  } catch (error) {
    console.error('Failed to save address:', error)
    alert('Something went wrong while saving the address')
  }
}
</script>

<template>
  <div class="address-page">
    <div class="address-card">
      <div class="card-header">
        <h1>{{ isEditing ? 'Edit Address' : 'Shipping Address' }}</h1>
      </div>

      <div v-if="validationMessage" class="form-error">
        {{ validationMessage }}
      </div>

      <form class="address-form" @submit.prevent="submitAddress" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label for="phoneNumber">Phone Number *</label>
            <input
              id="phoneNumber"
              type="text"
              placeholder="+47 123 45 678"
              v-model="phoneNumber"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="streetAddress">Street Address *</label>
            <input
              id="streetAddress"
              type="text"
              placeholder="skippergata 123"
              v-model="streetAddress"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="apartment">Apartment, Suite, etc. (optional)</label>
            <input
              id="apartment"
              type="text"
              placeholder="Apt 4B"
              v-model="apartment"
            />
          </div>
        </div>

        <div class="form-row three-columns">
          <div class="form-group">
            <label for="city">City *</label>
            <input
              id="city"
              type="text"
              placeholder="Tromsø"
              v-model="city"
              required
            />
          </div>

          <div class="form-group">
            <label for="state">State *</label>
            <input
              id="state"
              type="text"
              placeholder="Troms"
              v-model="state"
              required
            />
          </div>

          <div class="form-group">
            <label for="zipCode">ZIP Code *</label>
            <input
              id="zipCode"
              type="text"
              placeholder="1001"
              v-model="zipCode"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="country">Country *</label>
            <select id="country" v-model="country" required>
              <option>Norway</option>
              <option>Sweden</option>
              <option>United Kingdom</option>
              <option>Germany</option>
              <option>France</option>
              <option>Spain</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit">{{ isEditing ? 'Update Address' : 'Save Address' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.address-page {
  width: 100%;
  padding: 40px 20px;
  box-sizing: border-box;
  background: #f3f3f3;
}

.address-card {
  max-width: 1050px;
  margin: 0 auto;
  background: #f7f7f7;
  border: 1px solid #d7d7d7;
  border-radius: 16px;
  padding: 28px 30px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f7f7f7;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #111;
}

.address-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-row {
  display: grid;
  gap: 20px;
}

.two-columns {
  grid-template-columns: 1fr 1fr;
}

.three-columns {
  grid-template-columns: 1fr 1fr 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin-bottom: 10px;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 58px;
  padding: 0 18px;
  font-size: 16px;
  color: #333;
  background: #fcfcfc;
  border: 1px solid #cfd4dc;
  border-radius: 14px;
  box-sizing: border-box;
  outline: none;
}

.form-group input::placeholder {
  color: #8d96a3;
}

.form-error {
  margin-bottom: 16px;
  padding: 12px 16px;
  color: #842029;
  background: #f8d7da;
  border: 1px solid #f5c2c7;
  border-radius: 12px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #8a8a8a;
}

.form-actions {
  margin-top: 8px;
}

.address-form button {
  padding: 14px 24px;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  background: #000;
  color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.address-form button:hover {
  background: #222;
}

.address-form button:active {
  background-color: #333;
  transform: translateY(1px);
}

@media (max-width: 900px) {
  .two-columns,
  .three-columns {
    grid-template-columns: 1fr;
  }

  .address-card {
    padding: 22px 18px;
  }

  .autofill-preview {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>